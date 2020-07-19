module.exports = function (error) {
    let err_list = [];
    if (error) {
        error.details.forEach(element => {
            err_list.push(element.message);
        });
    }
    return err_list;
}