class CrcCheck {
    static calcChecksum(bArr) {
        let lookupTable = [0, 4129, 8258, 12387, 16516, 20645, 24774, 28903, 33032, 37161, 41290, 45419, 49548, 53677, 57806, 61935, 4657, 528, 12915, 8786, 21173, 17044, 29431, 25302, 37689, 33560, 45947, 41818, 54205, 50076, 62463, 58334, 9314, 13379, 1056, 5121, 25830, 29895, 17572, 21637, 42346, 46411, 34088, 38153, 58862, 62927, 50604, 54669, 13907, 9842, 5649, 1584, 30423, 26358, 22165, 18100, 46939, 42874, 38681, 34616, 63455, 59390, 55197, 51132, 18628, 22757, 26758, 30887, 2112, 6241, 10242, 14371, 51660, 55789, 59790, 63919, 35144, 39273, 43274, 47403, 23285, 19156, 31415, 27286, 6769, 2640, 14899, 10770, 56317, 52188, 64447, 60318, 39801, 35672, 47931, 43802, 27814, 31879, 19684, 23749, 11298, 15363, 3168, 7233, 60846, 64911, 52716, 56781, 44330, 48395, 36200, 40265, 32407, 28342, 24277, 20212, 15891, 11826, 7761, 3696, 65439, 61374, 57309, 53244, 48923, 44858, 40793, 36728, 37256, 33193, 45514, 41451, 53516, 49453, 61774, 57711, 4224, 161, 12482, 8419, 20484, 16421, 28742, 24679, 33721, 37784, 41979, 46042, 49981, 54044, 58239, 62302, 689, 4752, 8947, 13010, 16949, 21012, 25207, 29270, 46570, 42443, 38312, 34185, 62830, 58703, 54572, 50445, 13538, 9411, 5280, 1153, 29798, 25671, 21540, 17413, 42971, 47098, 34713, 38840, 59231, 63358, 50973, 55100, 9939, 14066, 1681, 5808, 26199, 30326, 17941, 22068, 55628, 51565, 63758, 59695, 39368, 35305, 47498, 43435, 22596, 18533, 30726, 26663, 6336, 2273, 14466, 10403, 52093, 56156, 60223, 64286, 35833, 39896, 43963, 48026, 19061, 23124, 27191, 31254, 2801, 6864, 10931, 14994, 64814, 60687, 56684, 52557, 48554, 44427, 40424, 36297, 31782, 27655, 23652, 19525, 15522, 11395, 7392, 3265, 61215, 65342, 53085, 57212, 44955, 49082, 36825, 40952, 28183, 32310, 20053, 24180, 11923, 16050, 3793, 7920];
        let i = 0;
        const length = bArr.length;
        let i2 = 0;
        while ((i < length)) {
            const i3 = i2 >> 8;
            i2 = (((i2 << 8) & 65535) ^ lookupTable[(bArr[i] & 255) ^ i3] & 65535);
            i++;
        }
        return i2;
    }
}

class CmdData {
    constructor(x, y, z) {
        this.cmdData = [0, 0, 0, 0, 0, 0, 0];

        const bArr = [(6 | 0), (((y >> 8) | x) | 0), (y | 0), ((z >> 8) | 0), (z | 0)];
        const crc = CrcCheck.calcChecksum(bArr);
        this.cmdData[0] = bArr[0];
        this.cmdData[1] = bArr[1];
        this.cmdData[2] = bArr[2];
        this.cmdData[3] = bArr[3];
        this.cmdData[4] = bArr[4];
        this.cmdData[5] = ((crc >> 8) & 0xFF);
        this.cmdData[6] = (crc & 0xFF);
    }

    getPart1() {
        return this.cmdData[0] & 255;
    }

    getPart2() {
        return ((this.cmdData[1] & 255) << 8) | (this.cmdData[2] & 255);
    }

    getAll() {
        return this.cmdData;
    }
}

const serviceUUID = 0x0000fee900001000800000805f9b34fb;

var cmdDataArr = [];

var moveDirection = {
    up: false,
    down: false,
    left: false,
    right: false
};

document.getElementById('connectButton').addEventListener('click', function(event) {
    connect();
});

document.onkeydown = checkKey;

function checkKey(e) {
    switch (e.code) {
    case 'ArrowUp':
        cmdDataArr.push(new CmdData(0, 4097, 3717));
        break;
    case 'ArrowDown':
        cmdDataArr.push(new CmdData(0, 4097, 378));
        break;
    case 'ArrowLeft':
        cmdDataArr.push(new CmdData(0, 4098, 378));
        break;
    case 'ArrowRight':
        cmdDataArr.push(new CmdData(0, 4098, 3717));
        break;
    case 'KeyR':
        cmdDataArr.push(new CmdData(1, 49185, 1));
        break;
    case 'KeyC':
        cmdDataArr.push(new CmdData(1, 49185, 0));
        break;
    default:
        break;
    }

}

function writeCharacteristicFunction(characteristic) {
    return async function(bArr) {
        await characteristic.writeValue(bArr);
    };
}

//every 0.5sec
function timerLoop(sendCmdToDevice) {
    let i = 0;
    return async function() {
        i++;

        if (i === 10) {
            cmdDataArr.push(new CmdData(1, 6, 0));
        }
        if (i === 15) {
            cmdDataArr.push(new CmdData(1, 34, 0));
            cmdDataArr.push(new CmdData(1, 35, 0));
        }
        if (i === 20) {
            cmdDataArr.push(new CmdData(1, 36, 0));
        }

        if (i == 25) {
            i = 0;
        }

        if (moveDirection.up) {
            cmdDataArr.push(new CmdData(0, 4097, 3717));
        }
        if (moveDirection.down) {
            cmdDataArr.push(new CmdData(0, 4097, 378));
        }
        if (moveDirection.left) {
            cmdDataArr.push(new CmdData(0, 4098, 378));
        }
        if (moveDirection.right) {
            cmdDataArr.push(new CmdData(0, 4098, 3717));
        }


        if (cmdDataArr.length >= 2) {
            let bArr = new Uint8Array(14);
            bArr.set(cmdDataArr[0].getAll(), 0);
            cmdDataArr.shift();
            bArr.set(cmdDataArr[0].getAll(), 7);
            cmdDataArr.shift();

            sendCmdToDevice(bArr);
        } else if (cmdDataArr.length > 0) {
            let bArr = new Uint8Array(7);
            bArr.set(cmdDataArr[0].getAll(), 0);
            cmdDataArr.shift();

            sendCmdToDevice(bArr);
        }
    };
}

function toSignedInt(num) {
    if ((num & 0x8000) > 0) {
        num = num - 0x10000;
    }

    return num;
}

function handleNotifications(event) {
    const cmdData = event.target.value;
    const s = (((cmdData.getUint8(3) & 255) << 8) | (cmdData.getUint8(4) & 255));
    const s2 = ((cmdData.getUint8(1) & 255) << 8) | (cmdData.getUint8(2) & 255);
    switch (s2) {
    case 258:
        console.log(((cmdData.getUint8(3) & 255) << 8) | (cmdData.getUint8(4) & 255)); // 1024 = Rider-M
        break;
    case 262:
        let i = 2;
        setBatteryValue(((s - (i * 325)) * 100) / (i * 75));
        break;
    case 263:
        if (s != 0) {
            console.log('power on');
            break;
        }
        console.log('power off');
        break;
    case 290: //pitch 
        setPitch(toSignedInt(s) / 100);
        break;
    case 291: //roll
        setRoll(toSignedInt(s) / 100);
        break;
    case 292: //pan
        setPan(toSignedInt(s) / 100);
        break;
    case 295: //follow mode
        if (s != 0) {
            if (s != 1) {
                if (s == 2) {
                    console.log('full mode');
                    break;
                }
            }
            console.log('lock mode');
            break;
        }
        console.log('follow mode');
        break;
        break;
    }
}

async function connect() {
    const device = await navigator.bluetooth.requestDevice({
      // filters: [{
      //   name: 'Rider-MDB8C'
      //   }],
      //acceptAllDevices: true, 
      optionalServices: ['0000fee9-0000-1000-8000-00805f9b34fb']
    });

    const server = await device.gatt.connect();
    const service = await server.getPrimaryServices();
    console.log('service', service);
    const characteristic = await service[0].getCharacteristics();
    console.log('characteristic', characteristic);

    const writeCharecteristic = characteristic.find((item) => item.uuid === 'd44bc439-abfd-45a2-b575-925416129600');
    const notifyCharacteristic = characteristic.find((item) => item.uuid === 'd44bc439-abfd-45a2-b575-925416129601');

    await notifyCharacteristic.startNotifications();

    notifyCharacteristic.addEventListener('characteristicvaluechanged',
                                      handleNotifications);

    setInterval(
        timerLoop(
            writeCharacteristicFunction(writeCharecteristic)
        ),
    50);
}

