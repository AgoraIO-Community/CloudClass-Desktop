// WIP: Visible Rect Compute 
const getViewPort = () => {
  if (document.compatMode === 'BackCompact') {
    return {
      width: document.body.clientWidth,
      height: document.body.clientHeight
    }
  } else {
    return {
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight
    }
  }
}


export const rgbaToHexColor = (color:string) => {
  const reg = /^(rgb|RGB|RGBA|rgba)/;
  if (reg.test(color)) {
    let strHex = "#";
    const colorArr = color.replace(/(?:\(|\)|rgba|RGBA|RGB|rgb)*/g, "").split(",");
    for (let i = 0; i < colorArr.length - 1; i++) {
      let hex = Number(colorArr[i]).toString(16);
      if (hex === "0") {
        hex += hex;
      }
      strHex += hex;
    }
    return strHex;
  } else {
    return color;
  }
}

export function isPromise(p: any) {
  return p && Object.prototype.toString.call(p) === "[object Promise]";
}