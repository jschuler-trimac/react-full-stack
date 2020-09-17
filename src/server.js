import express from 'express'
import bodyParser from 'body-parser'
import { withDB } from './db'
import path from 'path'
import { MongoClient } from 'mongodb'


const articlesInfo = {
    'learn-react': { upvotes: 0, comments: [] },
    'learn-node': { upvotes: 0, comments: [] },
    'my-thoughts-on-resumes': { upvotes: 0, comments: [] }
}

const app = express()

app.use(express.static(path.join(__dirname, '/build')))
app.use(bodyParser.json())

// Jeff Notes:
// If you are seeing this, please use the mongoose npm library
// Use connection pools

// This is using the db function
app.get('/api/articles/:name', async (req, res) => {
    withDB(async db => {
        const articleName = req.params.name
     
        const articleInfo = await db.collection('articles')
            .findOne({ name: articleName })

        if (articlesInfo) {
            res.status(200).json(articleInfo)
        } else {
            res.status(404).send("Article not found!")
        }
    })
})

// This is not using the DB function
app.post('/api/articles/:name/upvote', async (req, res) => {
    try {
        const articleName = req.params.name
        const client = await MongoClient.connect(
            'mongodb://localhost:27017',
            { useNewUrlParser: true, useUnifiedTopology: true }
        )
        
        const db = client.db('react-blog-db')
        const articleInfo = await db.collection('articles')
            .findOne({ name: articleName })

        if (!articleInfo) return res.status(404).send("Article not found!")

        await db.collection('articles').updateOne({ name: articleName }, {
            '$set': { upvotes: articleInfo.upvotes + 1 }
        })

        const updateArticleInfo = await db.collection('articles')
        .findOne({ name: articleName })

        res.status(200).json(updateArticleInfo)

        client.close()
    } catch (e) {
        res.status(500).send(e)
    }

})

app.post('/api/articles/:name/comment', async (req, res) => {
    try {
        const articleName = req.params.name
        const newComment = req.body.comment
        const client = await MongoClient.connect(
            'mongodb://localhost:27017',
            { useNewUrlParser: true, useUnifiedTopology: true }
        )
        
        const db = client.db('react-blog-db')
        const articleInfo = await db.collection('articles')
            .findOne({ name: articleName })

        if (!articleInfo) return res.status(404).send("Article not found!")

        await db.collection('articles').updateOne({ name: articleName }, {
            '$set': { comments: articleInfo.comments.concat(newComment) }
        })

        const updateArticleInfo = await db.collection('articles')
        .findOne({ name: articleName })

        res.status(200).json(updateArticleInfo)

        client.close()
    } catch (e) {
        res.status(500).send(e)
    }
})


// app.get('/hello', (req, res) => {
//     res.send('Hello!')
// })

// app.get('/hello/:name', (req, res) => {
//     const { name } = req.params;

//     res.send(`Hello ${name}!!!!`)
// })

// app.post('/hello', (req, res) => {
//     const { name } = req.body;

//     res.send(`Hello ${name}!`)
// })

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '/build/index.html'))
})

app.listen(8000, () => console.log("Server is listening on port 8000"))