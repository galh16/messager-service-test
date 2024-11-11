export const getCurrentDayAndMonth = () => {
    const date = new Date();

    const month = date.getMonth();
    const day = date.getDay();

    let setMonth, setDay = '';
    if(month < 10){
        setMonth = "0"+month;
    } else {
        setMonth = ""+month;
    }

    if(day < 10){
        setDay = "0"+day;
    } else {
        setDay = ""+day;
    }

  return { month: setMonth, day: setDay };
}

export const getCurrentTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
  
    return { hours: hours, minutes: minutes, seconds: seconds };
  }