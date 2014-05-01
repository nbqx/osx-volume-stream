var Readable = require('stream').Readable,
    exec = require('child_process').exec;

var csv2 = require('csv2'),
    through2 = require('through2');

function getVolume(){
  var rs = new Readable;
  var cmd = 'osascript -e "get volume settings"';
  rs._read = function(){
    exec(cmd,function(err,stdout,stderr){
      if(err) return rs.emit('error',err);
      if(stderr) return rs.emit('error',stderr);
      rs.push(stdout);
    });
  };
  return rs 
};
 
function valueParser(){
  function _split(str){
    return str.split(/:/)[1];
  };
  return through2({objectMode: true}, function(chunk,enc,next){
    this.push({
      output: parseInt(_split(chunk[0])),
      input: parseInt(_split(chunk[1])),
      alert: parseInt(_split(chunk[2])),
      muted: (_split(chunk[3])==='true')
    });
    next();
  });
};

module.exports = function(){
  return getVolume()
    .pipe(csv2())
    .pipe(valueParser());
};
