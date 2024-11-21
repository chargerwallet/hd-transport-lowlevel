import * as _chargerwallet_hd_transport from '@chargerwallet/hd-transport';
import _chargerwallet_hd_transport__default, { LowlevelTransportSharedPlugin } from '@chargerwallet/hd-transport';
import EventEmitter from 'events';

type LowLevelAcquireInput = {
    uuid: string;
};

declare class LowlevelTransport {
    _messages: ReturnType<typeof _chargerwallet_hd_transport__default.parseConfigure> | undefined;
    configured: boolean;
    Log?: any;
    emitter?: EventEmitter;
    plugin: LowlevelTransportSharedPlugin;
    init(logger: any, emitter: EventEmitter, plugin: LowlevelTransportSharedPlugin): void;
    configure(signedData: any): void;
    listen(): void;
    enumerate(): Promise<_chargerwallet_hd_transport.LowLevelDevice[]>;
    acquire(input: LowLevelAcquireInput): Promise<{
        uuid: string;
    }>;
    release(uuid: string): Promise<boolean>;
    call(uuid: string, name: string, data: Record<string, unknown>): Promise<_chargerwallet_hd_transport.MessageFromChargerWallet>;
    cancel(): void;
}

export { LowlevelTransport as default };
