// 您可以在项目中安装 mockjs, 来使用 mockjs 的特性快速生成 mock 数据
// const {Random} = require('mockjs')
//
// module.exports = {
//   status: 'ok',
//   data: {
//     name: Random.first(),
//     age: Random.natural(0, 100),
//     birth: Random.date(),
//     photo: Random.image('200x100', '#02adea', 'Hello'),
//     sex: Random.natural(0, 1),
//     things: Random.range(Random.natural(2, 20)).map(() => ({
//       name: Random.word(5, 15),
//       desc: Random.paragraph(1, 2)
//     }))
//   }
// }
//
module.exports = {
  status: 'ok',
  data: {
    name: 'jack ma',
    age: 17,
    sex: 6,
    birth: '2002-2-2',
    photo: 'https://www.baidu.com/favicon.ico',
    things: [{
      name: 'taobao',
      desc: '最大的电商平台'
    }, {
      name: '羽绒服',
      desc: '大鹅羽绒服'
    }]
  }
}
