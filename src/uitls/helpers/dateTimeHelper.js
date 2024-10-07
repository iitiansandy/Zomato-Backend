function compareTime(timeStr1, timeStr2) {
    let dateTime1 = new Date(timeStr1);
    let dateTime2 = new Date(timeStr2);

    return dateTime1.getTime() > dateTime2.getTime();
};

module.exports = {
    compareTime
}