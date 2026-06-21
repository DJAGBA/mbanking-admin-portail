export interface APIResponse<T> {
    status?: Status;
    data?:   T;
}

export interface Status {
    code?:        number;
    message?:     string;
    description?: string;
}
