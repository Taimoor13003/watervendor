
export const zeroPadding = (number, length) => {

    if(!number) number  = 0 
    var my_string = '' + number;
    while (my_string.length < length) {
        my_string = '0' + my_string;
    }

    return my_string;

}
export var formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});



// function Dollar(amount) {
//     var words = new Array();
//     words[0] = 'zero'; words[1] = 'One'; words[2] = 'Two'; words[3] = 'Three'; words[4] = 'Four'; words[5] = 'Five'; words[6] = 'Six'; words[7] = 'Seven'; words[8] = 'Eight'; words[9] = 'Nine'; words[10] = 'Ten'; words[11] = 'Eleven'; words[12] = 'Twelve'; words[13] = 'Thirteen'; words[14] = 'Fourteen'; words[15] = 'Fifteen'; words[16] = 'Sixteen'; words[17] = 'Seventeen'; words[18] = 'Eighteen'; words[19] = 'Nineteen'; words[20] = 'Twenty'; words[30] = 'Thirty'; words[40] = 'Forty'; words[50] = 'Fifty'; words[60] = 'Sixty'; words[70] = 'Seventy'; words[80] = 'Eighty'; words[90] = 'Ninety'; words[100] = 'One Hundred'; words[200] = 'Two Hundred'; words[300] = 'Three Hundred'; words[400] = 'Four Hundred'; words[500] = 'Five Hundred'; words[600] = 'Six Hundred'; words[700] = 'Seven Hundred'; words[800] = 'Eight Hundred'; words[900] = 'Nine Hundred'; var op;
//     amount = amount.toString();
//     var atemp = amount.split('.');
//     var number = atemp[0].split(',').join('');
//     var n_length = number.length;
//     var words_string = '';
//     if (n_length <= 11) {
//         var n_array = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
//         var received_n_array = new Array();
//         for (var i = 0; i < n_length; i++) {
//             received_n_array[i] = number.substr(i, 1);
//         }
//         for (var i = 11 - n_length, j = 0; i < 11; i++, j++) {
//             n_array[i] = received_n_array[j];
//         }
//         for (var i = 0, j = 1; i < 11; i++, j++) {
//             if (i == 0 || i == 3 || i == 6 || i == 9) {
//                 if (n_array[i] == 1) {
//                     n_array[j] = 10 + parseInt(n_array[j]);
//                     n_array[i] = 0;
//                 }
//             }
//         }
//         value = '';
//         for (var i = 0; i < 11; i++) {
//             if (i == 0 || i == 3 || i == 6 || i == 9) {
//                 value = n_array[i] * 10;
//             }
//             else if (i == 2 || i == 5 || i == 8) {
//                 value = n_array[i] * 100;
//             } else {
//                 value = n_array[i];
//             }

//             if (value != 0) {
//                 words_string += words[value] + ' ';
//             }
//             if ((i == 1 && value != 0) && (n_array[i - 1] > 0)) {
//                 words_string += 'Billion ';
//             } else if ((i == 1) && value != 0) {
//                 words_string += 'Biillion ';
//             }
//             if ((i == 4) && value == 0 && (n_array[i - 1] > 0 || n_array[i - 2] > 0)) {
//                 words_string += 'Million ';
//             } else if ((i == 4) && value != 0) {
//                 words_string += 'Million ';
//             }
//             if ((i == 7) && value == 0 && (n_array[i - 1] > 0 || n_array[i - 2] > 0)) {
//                 words_string += 'Thousand ';
//             } else if ((i == 7) && value != 0) {
//                 words_string += 'Thousand ';
//             }
//         }
//         words_string = words_string.split(' ').join(' ');
//     }
//     return words_string;
// }

// function DollarCent(n) {
//     var cur = document.getElementById('cur').value; var frac = document.getElementById('frac').value;
//     nums = n.toString().split('.')
//     var whole = Dollar(nums[0])
//     if (nums[1] == null) nums[1] = 0;
//     if (nums[1].length == 1) nums[1] = nums[1] + '0';
//     if (nums[1].length > 2) { nums[1] = nums[1].substring(2, length - 1) }
//     if (nums.length == 2) {
//         if (nums[0] <= 12) { nums[0] = nums[0] * 10 } else { nums[0] = nums[0] };
//         var fraction = Dollar(nums[1])
//         if (whole == '' && fraction == '') { op = 'Zero only'; }
//         if (whole == '' && fraction != '') { op = frac + ' ' + fraction + ' only'; }
//         if (whole != '' && fraction == '') { op = cur + ' ' + whole + ' only'; }
//         if (whole != '' && fraction != '') { op = cur + ' ' + whole + 'and ' + frac + ' ' + fraction + ' only'; }
//         amt = document.getElementById('amt').value;
//         if (amt > 99999999999.99) { op = 'Oops!!! The amount is too big to convert'; }
//         if (isNaN(amt) == true) { op = 'Error : Amount in number appears to be incorrect. Please Check.'; }
//         document.getElementById('op').innerHTML = op;
//     }
// }
// DollarCent(Math.round(document.getElementById('amt').value * 100) / 100);
