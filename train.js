#!/usr/bin/env node

// Simple training utility for WhatsApp Health Chatbot
// This script helps you add training examples easily

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

class TrainingHelper {
    constructor() {
        this.trainingDataPath = path.join(__dirname, 'trainingData.json');
        this.healthDataPath = path.join(__dirname, 'healthData.json');
        this.loadData();
    }

    loadData() {
        try {
            // Load training data
            if (fs.existsSync(this.trainingDataPath)) {
                const rawData = fs.readFileSync(this.trainingDataPath);
                this.trainingData = JSON.parse(rawData);
            } else {
                this.trainingData = { conversations: [], lastTrained: new Date().toISOString() };
            }

            // Load health data
            const rawHealthData = fs.readFileSync(this.healthDataPath);
            this.healthData = JSON.parse(rawHealthData);
            
            console.log('📚 Data loaded successfully');
        } catch (error) {
            console.error('❌ Error loading data:', error.message);
            process.exit(1);
        }
    }

    async askQuestion(question) {
        return new Promise((resolve) => {
            rl.question(question, (answer) => {
                resolve(answer.trim());
            });
        });
    }

    async addJSONTraining() {
        console.log('\n🎯 Adding JSON Training (healthData.json)');
        console.log('This will add a new health topic with keyword matching\n');

        const keywords = await this.askQuestion('Enter keywords (comma-separated): ');
        const keywordArray = keywords.split(',').map(k => k.trim());

        const englishResponse = await this.askQuestion('Enter English response: ');
        const hindiResponse = await this.askQuestion('Enter Hindi response: ');
        const oriyaResponse = await this.askQuestion('Enter Oriya response: ');

        const newQuestion = {
            keywords: keywordArray,
            response: {
                en: englishResponse,
                hi: hindiResponse,
                or: oriyaResponse
            }
        };

        this.healthData.questions.push(newQuestion);
        
        try {
            fs.writeFileSync(this.healthDataPath, JSON.stringify(this.healthData, null, 2));
            console.log('✅ JSON training data added successfully!');
        } catch (error) {
            console.error('❌ Error saving JSON data:', error.message);
        }
    }

    async addLLMTraining() {
        console.log('\n🤖 Adding LLM Training (trainingData.json)');
        console.log('This will add a conversation example for AI training\n');

        const input = await this.askQuestion('Enter user input: ');
        const output = await this.askQuestion('Enter bot response: ');
        const language = await this.askQuestion('Enter language (en/hi/or): ');

        const newConversation = {
            input: input.toLowerCase(),
            output,
            language,
            timestamp: new Date().toISOString()
        };

        this.trainingData.conversations.push(newConversation);
        this.trainingData.lastTrained = new Date().toISOString();
        
        try {
            fs.writeFileSync(this.trainingDataPath, JSON.stringify(this.trainingData, null, 2));
            console.log('✅ LLM training data added successfully!');
        } catch (error) {
            console.error('❌ Error saving LLM data:', error.message);
        }
    }

    showStats() {
        console.log('\n📊 Training Statistics:');
        console.log(`📝 JSON Topics: ${this.healthData.questions.length}`);
        console.log(`🤖 LLM Conversations: ${this.trainingData.conversations.length}`);
        console.log(`📅 Last LLM Training: ${this.trainingData.lastTrained}`);
        
        const languages = [...new Set(this.trainingData.conversations.map(c => c.language))];
        console.log(`🗣️ Languages in LLM data: ${languages.join(', ')}`);
    }

    async run() {
        console.log('🏥 WhatsApp Health Chatbot - Training Helper');
        console.log('===========================================\n');

        while (true) {
            console.log('\nChoose an option:');
            console.log('1. Add JSON Training (healthData.json)');
            console.log('2. Add LLM Training (trainingData.json)');
            console.log('3. Show Statistics');
            console.log('4. Exit');

            const choice = await this.askQuestion('\nEnter your choice (1-4): ');

            switch (choice) {
                case '1':
                    await this.addJSONTraining();
                    break;
                case '2':
                    await this.addLLMTraining();
                    break;
                case '3':
                    this.showStats();
                    break;
                case '4':
                    console.log('👋 Goodbye!');
                    rl.close();
                    return;
                default:
                    console.log('❌ Invalid choice. Please try again.');
            }
        }
    }
}

// Run the training helper
if (require.main === module) {
    const trainer = new TrainingHelper();
    trainer.run().catch(console.error);
}

module.exports = TrainingHelper;