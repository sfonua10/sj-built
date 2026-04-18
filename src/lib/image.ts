export async function resizeImage(
	file: File,
	{
		maxEdge = 2000,
		quality = 0.85,
		mimeType = "image/jpeg",
	}: { maxEdge?: number; quality?: number; mimeType?: string } = {},
): Promise<Blob> {
	const bitmap = await createImageBitmap(file);
	const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
	const width = Math.round(bitmap.width * scale);
	const height = Math.round(bitmap.height * scale);

	const canvas =
		typeof OffscreenCanvas !== "undefined"
			? new OffscreenCanvas(width, height)
			: Object.assign(document.createElement("canvas"), { width, height });
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("Canvas 2D not available");
	ctx.drawImage(bitmap, 0, 0, width, height);

	if ("convertToBlob" in canvas) {
		return await canvas.convertToBlob({ type: mimeType, quality });
	}
	return await new Promise<Blob>((resolve, reject) => {
		(canvas as HTMLCanvasElement).toBlob(
			(blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))),
			mimeType,
			quality,
		);
	});
}
