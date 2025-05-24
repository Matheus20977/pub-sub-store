const RabbitMQService = require('./rabbitmq-service')
const path = require('path')

require('dotenv').config({ path: path.resolve(__dirname, '.env') })

var report = {}
async function updateReport(products) {
    for(let product of products) {
        if(!product.name) {
            continue
        } else if(!report[product.name]) {
            report[product.name] = 1;
        } else {
            report[product.name]++;
        }
    }

}

async function printReport() {
    for (const [key, value] of Object.entries(report)) {
        console.log(`${key} = ${value} vendas`);
      }
}

async function consume() {
    console.log(`INSCRITO COM SUCESSO NA FILA: ${process.env.RABBITMQ_QUEUE_NAME}`)
    const rabbit = await RabbitMQService.getInstance()
    await rabbit.consume('report', async (msg) => {
        try {
            const products = JSON.parse(msg.content)
            const productsArray = Array.isArray(products) ? products : [products]
            await updateReport(productsArray)
            await printReport()
        } catch (error) {
            console.error('X ERROR TO PROCESS:', error)
        }
    })
} 

consume()
