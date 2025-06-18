import { WebGLRenderer } from 'three';
import { IScreenshot } from './IScreenshot';
// @ts-expect-error no declaration
import GIFEncoder from 'gif-encoder-2';


/**
 * utility type for taking snapshots of the current scene and exporting it to either PNG or GIF
 *
 * @author h.fleischer
 * @since 13.01.2021
 */
export class ScreenshotUtil {

    static readonly OUTPUT_DIM_X = 1280;
    static readonly OUTPUT_DIM_Y = 800; // 1024

    static getInstance(): ScreenshotUtil {
        if (!this.instance) {
            this.instance = new ScreenshotUtil();
        }
        return this.instance;
    }

    private static instance: ScreenshotUtil;

    // private screenshotOptions: IScreenshotOptions | undefined;
    private readonly frames: IScreenshot[];
    private counter: number;

    private constructor() {
        this.frames = [];
        this.counter = 0;
    }

    setDelay(frameIndex: number, delay: number): void {
        this.frames[frameIndex].delay = delay;
    }

    getFrameCount(): number {
        return this.frames.length;
    }

    getFrame(frameIndex: number): IScreenshot {
        return this.frames[frameIndex];
    }

    removeFrame(frameIndex: number): void {
        this.frames.splice(frameIndex, 1);
    }

    renderToFrame(gl: WebGLRenderer) { // , scene: Scene, camera: Camera, instant: number

        // console.warn('renderToFrame');
        this.frames.push({
            canvas: this.renderToCanvas(gl), // , scene, camera, instant
            delay: 50
        });

        // console.log('frames', this.frames);

    }

    exportToGif() {

        const gifEncoder = new GIFEncoder(ScreenshotUtil.OUTPUT_DIM_X, ScreenshotUtil.OUTPUT_DIM_Y, 'neuquant', false);
        gifEncoder.setDelay(50);

        gifEncoder.start();
        this.frames.forEach(gifFrame => {
            gifEncoder.setDelay(gifFrame.delay);
            gifEncoder.addFrame(gifFrame.canvas.getContext('2d'));
        });
        gifEncoder.finish();

        const data = gifEncoder.out.data;
        // console.log('data', data);
        const blob = new Blob([new Uint8Array(data)], {
            type: 'image/gif'
        });

        const anchor = document.createElement('a');
        anchor.href = URL.createObjectURL(blob);
        anchor.download = `canvas_3d_${Date.now()}.gif`;
        anchor.click();

    }

    exportToPng() {

        this.frames[0].canvas.toBlob(
            blob => {
                const a = document.createElement('a');
                const url = URL.createObjectURL(blob!);
                a.href = url;
                a.download = `canvas_3d_${this.counter.toString().padStart(3, '0')}`;
                a.click();
                this.counter++;
            },
            'image/png',
            1.0
        )

    }

    renderToCanvas(gl: WebGLRenderer): HTMLCanvasElement { // , scene: Scene, camera: Camera, instant: number

        // gl.render(scene, camera);

        const outputCanvas = document.createElement('canvas');
        outputCanvas.width = ScreenshotUtil.OUTPUT_DIM_X;
        outputCanvas.height = ScreenshotUtil.OUTPUT_DIM_Y;
        outputCanvas.style.width = 'inherit'; // for correct width in the preview window
        const outputContext = outputCanvas.getContext('2d')!;
        outputContext.fillStyle = document.body.style.backgroundColor;
        outputContext.fillRect(0, 0, outputCanvas.width, outputCanvas.height);

        outputContext.fillStyle = 'white';

        const scaleY = outputCanvas.height / gl.domElement.height;
        const dimX = gl.domElement.width * scaleY;
        const dimY = gl.domElement.height * scaleY;
        const offX = (ScreenshotUtil.OUTPUT_DIM_X - dimX) / 2;
        const offY = (ScreenshotUtil.OUTPUT_DIM_Y - dimY) / 2;

        outputContext.drawImage(gl.domElement, offX, offY, dimX, dimY);

        // outputContext.font = '24px Consolas';
        // outputContext.fillText(new Date(instant).toISOString(), 12, 30); //.substring(0, 16).replace('T', ' '),);

        return outputCanvas;

    }

    renderTextR(outputContext: CanvasRenderingContext2D, text: string, y: number, offX: number, dimX: number, margin: number) {
        outputContext.fillText(text, offX + dimX - margin - outputContext.measureText(text).width, y);
    }



}