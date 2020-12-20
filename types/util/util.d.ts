/**
 * @file 项目中常用的工具函数
 */
/**
 * 获取存在的文件目录
 *
 * @param {string[]} files 混合文件夹和文件的路径数组
 * @param {string} prefix 路径前缀
 * @return {*}
 */
declare function getDirectory(files: string[], prefix?: string): string[];
/**
 * 获取存在的文件路径
 * @param {string[]} files 混合文件夹和文件的路径数组
 * @return {*}  {string[]}
 */
declare function getFiles(files: string[]): string[];
/**
 * 判断是否存在文件
 * @param {String} file
 */
declare function existFile(file: any): boolean;
declare function parseFiles(files?: string): any;
export { getDirectory, getFiles, parseFiles, existFile };
