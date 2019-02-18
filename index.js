const SerialPort = require('serialport')
const crc = require('crc');
const { crc8 } = crc;
console.log("hello pcb test");

const msgs = [
    // 통신준비 확인
    ['00', '00',],

    // 자판기 확인
    ['00', '02',],

    // 주문 [메인키, 보조키, 컵종류, 케그번호, 세척유무, 원액(100, 10, 1), 물(100, 10, 1)]
    ['01', '00', '00', '00', '00', '01', '02', '03', '02', '03', '04',],

    // 세척 [메인키, 보조키, 케그번호]
    ['01', '01', '00']
];

// const port = new SerialPort('/dev/tty-usbserial1')
const config = {
    portName: "COM7",
    options: {
        baudRate: 9600,
        autoOpen: false
    }
};
const port = new SerialPort(config.portName, config.options);
const parser = new ByteLength({ length: 20 });
port.pipe(parser);


const addDummyAndCrc = msgs => msgs.map(
    msg => {
        const length = msg.length;
        // console.log(length);
        const rep = 19 - length;
        const msgWithDummyAndCrc = [...msg];
        for (let i = 0; i < rep; i++) {
            msgWithDummyAndCrc.push('FF');
        }

        msgWithDummyAndCrc.push(crc8(msgWithDummyAndCrc).toString(16));
        // console.log(`msgWithDummyAndCrc: ${msgWithDummyAndCrc}`);
        return msgWithDummyAndCrc;
    }
)

const addedMsgs = addDummyAndCrc(msgs);

addedMsgs.map(msg => {
    console.log(msg)
});

parser.on('data', console.log);
port.write(Buffer.from(addedMsgs[0]));