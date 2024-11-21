'use strict';

var hdShared = require('@chargerwallet/hd-shared');
var transport = require('@chargerwallet/hd-transport');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var transport__default = /*#__PURE__*/_interopDefaultLegacy(transport);

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

const { check, buildBuffers, receiveOne, parseConfigure } = transport__default["default"];
class LowlevelTransport {
    constructor() {
        this.configured = false;
        this.plugin = {};
    }
    init(logger, emitter, plugin) {
        this.Log = logger;
        this.emitter = emitter;
        this.plugin = plugin;
        this.plugin.init();
    }
    configure(signedData) {
        const messages = parseConfigure(signedData);
        this.configured = true;
        this._messages = messages;
    }
    listen() {
    }
    enumerate() {
        return this.plugin.enumerate();
    }
    acquire(input) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.plugin.connect(input.uuid);
                return { uuid: input.uuid };
            }
            catch (error) {
                this.Log.debug('lowlelvel transport connect error: ', error);
                throw hdShared.ERRORS.TypedError(hdShared.HardwareErrorCode.LowlevelTrasnportConnectError, (_a = error.message) !== null && _a !== void 0 ? _a : error);
            }
        });
    }
    release(uuid) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.plugin.disconnect(uuid);
                return true;
            }
            catch (error) {
                this.Log.debug('lowlelvel transport disconnect error: ', error);
                return false;
            }
        });
    }
    call(uuid, name, data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._messages === null || !this._messages) {
                throw hdShared.ERRORS.TypedError(hdShared.HardwareErrorCode.TransportNotConfigured);
            }
            const messages = this._messages;
            if (transport.LogBlockCommand.has(name)) {
                this.Log.debug('lowlevel-transport', 'call-', ' name: ', name);
            }
            else {
                this.Log.debug('lowlevel-transport', 'call-', ' name: ', name, ' data: ', data);
            }
            const buffers = buildBuffers(messages, name, data);
            for (const o of buffers) {
                const outData = o.toString('hex');
                this.Log.debug('send hex strting: ', outData);
                try {
                    yield this.plugin.send(uuid, outData);
                }
                catch (e) {
                    this.Log.debug('lowlevel transport send error: ', e);
                    throw hdShared.ERRORS.TypedError(hdShared.HardwareErrorCode.BleWriteCharacteristicError, e.reason);
                }
            }
            try {
                const response = yield this.plugin.receive();
                if (typeof response !== 'string') {
                    throw new Error('Returning data is not string');
                }
                this.Log.debug('receive data: ', response);
                const jsonData = receiveOne(messages, response);
                return check.call(jsonData);
            }
            catch (e) {
                this.Log.error('lowlevel call error: ', e);
                throw e;
            }
        });
    }
    cancel() {
        this.Log.debug('lowlevel-transport', 'cancel');
    }
}

module.exports = LowlevelTransport;
