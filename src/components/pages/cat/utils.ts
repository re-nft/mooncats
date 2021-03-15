import mooncatparser from "../../../lib/mooncatparser";

export const WRAPPER = "0x7c40c393dc0f283f318791d746d894ddd3693572";

export const hexToAscii = (str1: string): string => {
  const hex = str1.slice(2).toString();
  let str = "";
  for (let n = 0; n < hex.length; n += 2) {
    str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
  }
  return str;
};

export const calculatePrice = (price: string): number =>
  Number(price) / 1000000 / 1000000 / 1000000;

export function drawCat(catId: string, size: number): string {
  size = size || 10;
  const data = mooncatparser(catId);
  const canvas = document.createElement("canvas");
  canvas.width = size * data.length;
  canvas.height = size * data[1].length;
  const ctx = canvas.getContext("2d");

  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[i].length; j++) {
      const color = data[i][j];
      if (color && ctx) {
        ctx.fillStyle = color;
        ctx.fillRect(i * size, j * size, size, size);
      }
    }
  }
  return canvas.toDataURL();
}
