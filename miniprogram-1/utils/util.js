const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}


// 记录时间
function getDateDiff(dateTimeStamp) {
  const minute = 1000 * 60;
  const hour = minute * 60;
  const day = hour * 24;
  const month = day * 30;
  const year = day * 365;
  const now = new Date().getTime();
  const diffValue = now - dateTimeStamp;
  if(diffValue < 0){
   
      return '数据出错';
  }

  const yearC = diffValue / year;
  const monthC = diffValue / month;
  const weekC = diffValue / (7 * day);
  const dayC = diffValue / day;
  const hourC = diffValue / hour;
  const minC = diffValue / minute;
  let result = '';



  if(yearC >= 1){
      result = parseInt(yearC) + '年以前';
  }else if(monthC >= 1){
      result = parseInt(monthC) + '个月前';
  }else if(weekC >= 1){
      result = parseInt(weekC) + '星期前';
  }else if(dayC >= 1){
      result = parseInt(dayC) + '天前';
  }else if(hourC >= 1){
      result = parseInt(hourC) + '小时前';
  }else if(minC >= 5){
      result = parseInt(minC) + '分钟前';
  }else{
      result = '刚刚发表';
  }
  return result;
}

// 

function transformTab(tab) {
  
}


//导出函数 ,
module.exports = {
  formatTime,
  getDateDiff,
  transformTab
};