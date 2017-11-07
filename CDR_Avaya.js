// Load the TCP Library
net = require('net');
fs = require('fs');

var client = new net.Socket();
var countHeartBeat = 0;
var timeCloseFile = Date.now();

const port = 5000;
const cdrFolder = 'cdr';
const cdrFile = 'message.cdr';
const heartBeat = '#heartbeat#';

process.stdout.write('\n Check Port');

// check port on, if connect, send heartbeat
client.connect(port, '127.0.0.1', function () { 
  process.stdout.write('\n Port On');
  client.write(heartBeat);
  client.destroy();
  process.stdout.write('\n Exit process return 1');
  process.exit(1);
});

client.on('error', function(ex) {

  process.stdout.write('\n Port Off');
  process.stdout.write('\n Start Server');
  process.stdout.write('\n Check Folder Exist');

  if (!fs.existsSync(cdrFolder))
    fs.mkdirSync(cdrFolder);

  process.stdout.write('\n Check Files Exists');

  fs.readdirSync(cdrFolder).forEach(file => {
    if (file.length > 4)
    {
      if (file.substring(file.length-4,file.length).toLowerCase() == '.cdr')
      {
          fs.renameSync(cdrFolder+'/'+file, cdrFolder+'/'+file.substring(0,file.length-4)+'.'+Date.now().toString()+".log");
      }
    }
  });

  process.stdout.write('\n Start Create Socket');

  // Start a TCP Server
  net.createServer(function (socket) {
    var strDataFull = '';
    var strData = '';
    var endCharCode = 0;

    // Handle incoming messages from clients.
    socket.on('data', function (data) {
      strDataFull = data.toString();
      strData = strDataFull.replace(RegExp(heartBeat, "gi"),'');
      endCharCode = 0;
      
      if (strData.length >0)
      {
        fs.appendFileSync(cdrFolder+'/'+cdrFile, strData,'');
        endCharCode = strData.charCodeAt(strData.length-1);
      }
      else
      {
        if (strDataFull == heartBeat)
          countHeartBeat=countHeartBeat+1;
      }

      if (countHeartBeat >= 10 || endCharCode == 13 || endCharCode == 10)
      {
        countHeartBeat = 0;
        if (Math.floor((Date.now()-timeCloseFile)/60000) >= 5)
        {
           if (fs.existsSync(cdrFolder+'/'+cdrFile))
            fs.renameSync(cdrFolder+'/'+cdrFile, cdrFolder+'/'+cdrFile.substring(0,cdrFile.length-4)+'.'+timeCloseFile.toString()+".log");
          timeCloseFile = Date.now();
        }
      }

    });

  }).listen(port);

  process.stdout.write('\n End Create Socket');
  process.stdout.write("\n Coletor cdr Avaya 5000\n");    
});
