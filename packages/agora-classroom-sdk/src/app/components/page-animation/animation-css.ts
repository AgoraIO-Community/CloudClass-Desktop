type PageAnimationCSSProps = {
  time: number;
  deep: number;
  wrapperClassName: string;
};

export enum AnimationName {
  FORWARD = 'fcr-route-forward',
  BACK = 'fcr-route-back',
}

export class PageAnimationCSS {
  constructor({ time, deep, wrapperClassName }: PageAnimationCSSProps) {
    this.wrapperClassName = wrapperClassName;
    const translateZ = this.getTranslateZ();
    const ele = this.createStyleElement(String(translateZ));
    this.setStyleElement(ele);
    this.wrapperStyles(wrapperClassName, time);
    this.generateStyles(deep);
    PageAnimationCSS.instance = this;
  }

  static instance: PageAnimationCSS | null = null;

  static create({ time, deep, wrapperClassName }: PageAnimationCSSProps) {
    if (PageAnimationCSS.instance) {
      return PageAnimationCSS.instance;
    }
    return new PageAnimationCSS({ time, deep, wrapperClassName });
  }

  private wrapperClassName = '';

  private createStyleElement(id: string) {
    const style_id = 'page_animation_' + id;
    let styleElement = document.getElementById(style_id);
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = style_id;
    }
    return styleElement;
  }

  addNewStyle(newStyle: string) {
    this.styleElement?.appendChild(document.createTextNode(newStyle));
  }

  getTranslateZ() {
    const ele = document.getElementsByClassName(this.wrapperClassName)[0];
    if (ele) {
      return -ele.clientWidth / 2;
    }
    return 0;
  }
  private styleElement: HTMLElement | null = null;

  getStyleElement() {
    return this.styleElement;
  }

  setStyleElement(ele: HTMLElement) {
    if (ele !== this.getStyleElement()) {
      const body = document.getElementsByTagName('body')[0];
      body.appendChild(ele);
      this.oldStyleElement.push(this.getStyleElement() as HTMLElement);
      this.styleElement = ele;
      this.clearOldStyleElement();
    }
  }

  private oldStyleElement: HTMLElement[] = [];

  clearOldStyleElement() {
    while (this.oldStyleElement.length > 1) {
      const ele = this.oldStyleElement.pop();
      ele && document.body.removeChild(ele);
    }
  }

  private deep = 0;

  routeDeep() {
    return this.deep;
  }

  removeStyles() {
    const ele = this.getStyleElement();
    if (ele) document.body.removeChild(ele);
  }

  private createRotateYStyle(rotate: number) {
    return `.rotateY${rotate} {transform: rotateY(${rotate}deg);}`;
  }
  private wrapperStyleEle: HTMLElement | null = null;
  wrapperStyles(className: string, time: number) {
    const ele = this.createStyleElement('wrapper');
    ele.appendChild(
      document.createTextNode(`
    .${className} {
      width:100%;
      height:100%;
      transform-style: preserve-3d;
      transition: all ${time / 1000}s linear;
    }

    .${className} > div {
      width:100%;
      position:absolute;
      transition: none;
    }
    `),
    );
    if (this.wrapperStyleEle === ele) {
      return;
    }
    document.body.appendChild(ele);
  }

  private forwardStyles(rotate: number, translateZ: number) {
    /*
    命名：forward[rotate]
    开始角度为rotate，结束角度为 rotate + 90
    公式:rotate + enter rotate = -90
    公式:rotate + exit rotate = 0
    */
    return `
    .${AnimationName.FORWARD}${rotate}-enter,
    .${AnimationName.FORWARD}${rotate}-enter-active,
    .${AnimationName.FORWARD}${rotate}-enter-done {
      transform: rotateY(${-90 - rotate}deg) translateZ(${translateZ}px);
    }

    .${AnimationName.FORWARD}${rotate}-exit,
    .${AnimationName.FORWARD}${rotate}-exit-active,
    .${AnimationName.FORWARD}${rotate}-exit-done {
      transform: rotateY(${0 - rotate}deg) translateZ(${translateZ}px);
    }
    `;
  }

  private backStyles(rotate: number, translateZ: number) {
    /*
    命名：back[rotate]
    开始角度为rotate，结束角度为 rotate - 90
    公式:rotate + enter rotate = 90
    公式:rotate + exit rotate = 0
    */
    return `
    .${AnimationName.BACK}${rotate}-enter,
    .${AnimationName.BACK}${rotate}-enter-active,
    .${AnimationName.BACK}${rotate}-enter-done {
      transform: rotateY(${90 - rotate}deg) translateZ(${translateZ}px);
    }

    .${AnimationName.BACK}${rotate}-exit,
    .${AnimationName.BACK}${rotate}-exit-active,
    .${AnimationName.BACK}${rotate}-exit-done {
      transform: rotateY(${0 - rotate}deg) translateZ(${translateZ}px);
    }
    `;
  }

  private translateZ = 0;

  generateStyles(deep: number) {
    const translateZ = this.getTranslateZ();
    if (!translateZ && this.translateZ === translateZ && this.deep === deep) {
      return;
    }
    const ele = this.createStyleElement(String(translateZ));
    const styles = [];
    for (let i = 0; i < deep; i++) {
      styles.push(this.createRotateYStyle(i * 90));
      styles.push(this.forwardStyles(i * 90, translateZ));
      styles.push(this.backStyles(i * 90, translateZ));
      if (i !== 0) {
        styles.push(this.createRotateYStyle(-i * 90));
        styles.push(this.forwardStyles(-i * 90, translateZ));
        styles.push(this.backStyles(-i * 90, translateZ));
      }
    }
    ele.appendChild(document.createTextNode(styles.join('  ')));
    this.setStyleElement(ele);
    this.deep = deep;
    this.translateZ = translateZ;
  }

  appendStyles(deep: number) {
    const ele = this.getStyleElement();
    if (this.deep >= deep || !ele) {
      return;
    }
    const translateZ = this.translateZ;
    const styles = [];
    const index = this.deep;
    for (let i = index; i < deep; i++) {
      styles.push(this.createRotateYStyle(i * 90));
      styles.push(this.forwardStyles(i * 90, translateZ));
      styles.push(this.backStyles(i * 90, translateZ));
      if (i !== 0) {
        styles.push(this.createRotateYStyle(-i * 90));
        styles.push(this.forwardStyles(-i * 90, translateZ));
        styles.push(this.backStyles(-i * 90, translateZ));
      }
    }
    ele.appendChild(document.createTextNode(styles.join('  ')));
    this.deep = deep;
  }
}
