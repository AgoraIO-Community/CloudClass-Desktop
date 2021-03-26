import { existsSync, ensureDirSync, copySync, removeSync } from "fs-extra";
import { DownloaderHelper, Stats } from "node-downloader-helper";
import extract from "extract-zip";
const path = require("path")

/**
 * 解压 zip 文件, electron
 * @param {string} filePath - zip 文件绝对路径
 * @param {string} extractDirectory - 解压的目录，默认为和 zip 同目录下的同名文件夹，如:(test.zip -> test/)
 * @return {Promise<void>}
 */
export const extractZip = (filePath: string, extractDirectory: string): Promise<void> => {
  return extract(filePath, {
    dir: extractDirectory,
  });
};

interface Runtime {
  downloadsDirectory: string;
}

export const runtime: Runtime = {
  downloadsDirectory: "",
};


export class ElectronDownloadFile {
  private readonly url: string;
  private readonly downloadDIR: string = runtime.downloadsDirectory;
  private readonly downloaderHelper: DownloaderHelper;

  constructor(url: string, directory?: string) {
    this.url = url

    if (directory) {
      this.downloadDIR = directory
    }

    // 确保文件夹目录存在
    ensureDirSync(this.downloadDIR)

    this.downloaderHelper = new DownloaderHelper(this.url, this.downloadDIR, {
      override: true,
    });
  }

  static new(...args: any[]) {
    // @ts-ignore
    return new this(...args)
  }

  /**
   * 监听文件下载进度
   * @param {function} progressCallback - 进度回调
   */
  public onProgress(progressCallback: (progress: Stats) => any): void {
    this.downloaderHelper.on("progress", progress => progressCallback(progress));
  }

  /**
   * 监听文件下载完成
   * @param {function} endCallback - 结束回调
   */
  public onEnd(endCallback: (end: any) => any): void {
    this.downloaderHelper.on("end", d => {
      endCallback(d);
    });
  }

  /**
   * 监听文件是否下载失败
   * @param {function} errorCallback - 失败回调
   */
  public onError(errorCallback: (error: Error) => any): void {
    this.downloaderHelper.on("error", error => errorCallback(error));
  }

  /**
   * 开始下载
   */
  public start(): void {
    this.downloaderHelper.start();
  }

  /**
   * 检测文件是否存在
   * @param {string} filename - 要检测的文件名
   */
  public fileIsExists(filename: string): boolean {
    return existsSync(path.join(this.downloadDIR, filename));
  }
}
  // 下载进度
  // 下载错误回调
  // 下载结束

export const electronDownload = (downloadDirectory: string) => {
  const download = ElectronDownloadFile.new()

  download.onProgress((callback: { progress: number; }) => {
    // 下载进度
    const progress = Math.round(callback.progress)
  })

  download.onError((callback: any) => {
    console.log('callback error', callback)
  })

  download.onEnd((callback: any) => {
    console.log('callback end', callback)

    extractZip(callback.filePath, downloadDirectory).then(() => {
      // file target path
      // var targetPath = path.join(pptUUid ....)

      // remove original download zip file
      removeSync(callback.filePath)

      // copy unzip file to download directory
      //
      // copySync()

      // delete unzip file
      // removeSync()
    })
  })
}