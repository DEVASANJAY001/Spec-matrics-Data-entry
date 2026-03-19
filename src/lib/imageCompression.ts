/**
 * Compresses an image file using canvas.
 * @param file The image file to compress
 * @param maxWidth Max width of the output image
 * @param maxHeight Max height of the output image
 * @param quality Quality of the output JPEG (0 to 1)
 * @returns A promise that resolves to the compressed Blob
 */
export async function compressImage(
    file: File | Blob,
    maxWidth: number = 1200,
    maxHeight: number = 1200,
    quality: number = 0.7
): Promise<Blob> {
    return new Promise((resolve, reject) => {
        try {
            const url = URL.createObjectURL(file);
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Calculate new dimensions while maintaining aspect ratio
                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    URL.revokeObjectURL(url);
                    reject(new Error('Canvas context not available'));
                    return;
                }

                // Fill white background for transparent images
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, width, height);
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (compressedBlob) => {
                        URL.revokeObjectURL(url);
                        if (compressedBlob) {
                            resolve(compressedBlob);
                        } else {
                            reject(new Error('Canvas toBlob failed'));
                        }
                    },
                    'image/jpeg',
                    quality
                );
            };
            img.onerror = (err) => {
                URL.revokeObjectURL(url);
                reject(err);
            };
            img.src = url;
        } catch (error) {
            reject(error);
        }
    });
}
