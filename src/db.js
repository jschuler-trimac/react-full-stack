import { MongoClient } from 'mongodb'

export const withDB = async operations => {
    try {
        const client = await MongoClient.connect(
            'mongodb://localhost:27017',
            { useNewUrlParser: true, useUnifiedTopology: true }
        )
        
        const db = client.db('react-blog-db')

        const result = await operations(db)

        client.close()

        return result
    } catch (e) {
        return e
    }
}