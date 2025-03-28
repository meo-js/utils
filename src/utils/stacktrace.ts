/**
 * 获取当前函数调用栈字符串
 *
 * @param ignore 可提供要忽略栈的函数，仅 `v8` 引擎支持该参数，见 https://v8.dev/docs/stack-trace-api
 * @returns 调用栈字符串
 */
export function captureStackTraceString(ignore?: Function): string {
    const Err = <
        {
            captureStackTrace?(target: object, ignore?: Function): void;
        }
    >Error;
    if (Err.captureStackTrace) {
        const temp = { stack: "" as string | undefined };
        Err.captureStackTrace(temp, ignore);
        return temp.stack?.replace("Error\n    ", "") ?? "";
    } else {
        return (
            new Error("TempStack").stack?.replace("Error: TempStack\n    ", "")
            ?? ""
        );
    }
}
