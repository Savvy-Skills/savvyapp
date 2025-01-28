import { useEffect, useState } from 'react';

const useBroadcastChannel = (channelName: string) => {
    const [message, setMessage] = useState<any>(null);
    const channel = new BroadcastChannel(channelName);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            setMessage(event.data);
        };

        channel.onmessage = handleMessage;

        // Clean up the channel when the component unmounts
        return () => {
            channel.close();
        };
    }, [channel]);

    const sendMessage = (msg: any) => {
        channel.postMessage(msg);
    };

    return { message, sendMessage };
};

export default useBroadcastChannel;