export interface IPushMessage {
    Title: string;
    Body: string;
    Icon: string;
    Action: string;
    Sound: string;
    Data: {
        [key: string]: string;
    };
}