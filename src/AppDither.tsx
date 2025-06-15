
import { ThemeProvider } from '@emotion/react';
import { CssBaseline } from '@mui/material';
import { ThemeUtil } from './util/ThemeUtil';
import { useEffect, useRef } from 'react';
import { Buffer } from 'buffer';
import * as bmp from 'bmp-ts';
import { Token } from '@mui/icons-material';

const theme = ThemeUtil.createTheme();

type rgb = [number, number, number];

function AppDither() {

  // https://github.com/MortimerWittgenstein/FloydSteinbergAlgorithm/blob/master/floydSteinberg.js

  function floydSteinbergDithering(contxt: CanvasRenderingContext2D, palArr: rgb[], w: number, h: number, errorMultiplier = 1.0) {

    const ctxData = contxt.getImageData(0, 0, w, h);
    const imgData = ctxData.data;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {

        let id = ((y * w) + x) * 4;

        const oldpixel: rgb = [imgData[id], imgData[id + 1], imgData[id + 2]];

        // determine closest color in palette
        const newpixel = findClosest(oldpixel, palArr);

        // apply new pixel to data
        imgData[id] = newpixel[0];
        imgData[id + 1] = newpixel[1];
        imgData[id + 2] = newpixel[2];

        // set alpha channel to 255
        imgData[id + 3] = 255;

        // calculate quantization error
        const quantErr = getQuantErr(oldpixel, newpixel);

        // offset: pixel[x+1, y]
        id = ((y * w) + (x + 1)) * 4;
        if (id < imgData.length) {
          const err = applyErr([imgData[id], imgData[id + 1], imgData[id + 2]], quantErr, (7 / 16), errorMultiplier);
          imgData[id] = err[0];
          imgData[id + 1] = err[1];
          imgData[id + 2] = err[2];
        }

        // offset: pixel[x-1, y+1]
        id = (((y + 1) * w) + (x - 1)) * 4;
        if (id < imgData.length) {
          const err = applyErr([imgData[id], imgData[id + 1], imgData[id + 2]], quantErr, (3 / 16), errorMultiplier);
          imgData[id] = err[0];
          imgData[id + 1] = err[1];
          imgData[id + 2] = err[2];
        }

        // offset: pixel[x, y+1]
        id = (((y + 1) * w) + x) * 4;
        if (id < imgData.length) {
          const err = applyErr([imgData[id], imgData[id + 1], imgData[id + 2]], quantErr, (5 / 16), errorMultiplier);
          imgData[id] = err[0];
          imgData[id + 1] = err[1];
          imgData[id + 2] = err[2];
        }

        // offset: pixel[x+1, y+1]
        id = (((y + 1) * w) + (x + 1)) * 4;
        if (id < imgData.length) {
          const err = applyErr([imgData[id], imgData[id + 1], imgData[id + 2]], quantErr, (1 / 16), errorMultiplier);
          imgData[id] = err[0];
          imgData[id + 1] = err[1];
          imgData[id + 2] = err[2];
        }
      }
    }

    contxt.putImageData(ctxData, 0, 0);

  }

  function findClosest(oldpixel: rgb, palArr: rgb[]): rgb {
    let maxDist = 766; // 255 * 3 + 1
    let idx = 0;
    for (let i = 0; i < palArr.length; i++) {
      const dist = Math.abs(oldpixel[0] - palArr[i][0]) + Math.abs(oldpixel[1] - palArr[i][1]) + Math.abs(oldpixel[2] - palArr[i][2]);
      if (dist < maxDist) {
        maxDist = dist;
        idx = i;
      }
    }
    return palArr[idx];
  }

  function getQuantErr(oldpixel: rgb, newpixel: rgb) {
    oldpixel[0] -= newpixel[0];
    oldpixel[1] -= newpixel[1];
    oldpixel[2] -= newpixel[2];
    return oldpixel;
  }

  function applyErr(pixel: rgb, error: rgb, factor: number, multiplier: number) {
    pixel[0] += error[0] * factor * multiplier;
    pixel[1] += error[1] * factor * multiplier;
    pixel[2] += error[2] * factor * multiplier;
    return (pixel);
  }

  const imageRef = useRef<HTMLImageElement>(null);
  useEffect(() => {

    console.debug('✨ building dither component');

    // const c3 = 0xff;
    // const c2 = 0x88;
    // const c1 = 0x55;
    // const c0 = 0x00;

    const srcImg = new Image();
    const palArr: rgb[] = [
      [0xf2, 0xf4, 0xef],
      [0xb1, 0xaf, 0xad],
      [0x70, 0x69, 0x6b],
      [0x2f, 0x24, 0x29],
      // [c3, c3, c3],
      // [c2, c2, c2],
      // [c1, c1, c1],
      // [c0, c0, c0],
    ]

    function toKey(val: number) {
      return `0x${val.toString(16)}`;
    }

    srcImg.onload = function () {

      console.log('srcImg', srcImg, srcImg.height);

      const canvas = document.createElement('canvas');
      const contxt = canvas.getContext('2d');

      canvas.width = srcImg.width;
      canvas.height = srcImg.height;

      contxt!.drawImage(srcImg, 0, 0, srcImg.width, srcImg.height);

      floydSteinbergDithering(contxt!, palArr, srcImg.width, srcImg.height, 1.00);

      const dataUrl = canvas.toDataURL();
      imageRef.current!.src = dataUrl;

      const ctxData = contxt!.getImageData(0, 0, srcImg.width, srcImg.height);
      const ctxBuff: Buffer = Buffer.from(ctxData.data.buffer);

      const valData: number[] = [];
      for (let i = 0; i < ctxBuff.length; i += 4) {
        valData.push(ctxBuff[i]);
      }
      const valMap: { [K in string]: number } = {};

      valMap[toKey(palArr[3][0])] = 1; // black
      valMap[toKey(palArr[2][0])] = 4
      valMap[toKey(palArr[1][0])] = 5;
      valMap[toKey(palArr[0][0])] = 0; // white

      console.log(valData.length);
      console.log(valData.map(b => valMap[toKey(b)]).join(','));


      // fix byte order
      // let b0, b1, b2, b3 = 0;
      // for (let i = 0; i < ctxBuff.length; i += 4) {
      //   b0 = ctxBuff[i + 0];
      //   b1 = ctxBuff[i + 1];
      //   b2 = ctxBuff[i + 2];
      //   b3 = ctxBuff[i + 3];
      //   ctxBuff[i + 0] = b3;
      //   ctxBuff[i + 1] = b2;
      //   ctxBuff[i + 2] = b1;
      //   ctxBuff[i + 3] = b0;
      // }

      // const bmpDecd = {
      //   data: ctxBuff, // Buffer
      //   bitPP: 24, // The number of bits per pixel
      //   width: srcImg.width, // Number
      //   height: srcImg.height, // Number
      // };
      // const bmpData = bmp.encode(bmpDecd).data;
      // const bmpBlob = new Blob([bmpData], { type: "image/bmp" });// change resultByte to bytes

      // console.log(bmpData.length);
      // console.log(Array.from(bmpData).map(b => `0x${b.toString(16)}`).join(','));


      // const link = document.createElement('a');
      // link.href = window.URL.createObjectURL(bmpBlob);
      // link.download = "myFileName.bmp";
      // link.click();

    }
    srcImg.src = 'snail.jpg';

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div style={{ width: '100%', height: '100%' }}>
        <img ref={imageRef} />
      </div>
    </ThemeProvider>
  );
}

export default AppDither;
