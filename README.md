# Daiana - Your Friendly DAO Governance Assistant

Daiana is an AI-powered chat agent that helps DAOs and their communities understand and navigate decentralized governance. Through natural conversations on Telegram and Twitter, she makes DAO governance accessible and engaging through explanations, examples, and memes.

## 🌟 Key Features

### Governance Education
- Explain DAO concepts through clear examples and analogies
- Share insights from real-world DAO successes and failures
- Help draft and review governance proposals
- Make governance fun with custom memes and visuals

### Social Integration
- Chat naturally with users through Telegram
- Engage with community on Twitter
- Generate educational content and memes
- Maintain consistent presence across platforms

### AI Capabilities
- Natural language conversations about DAOs
- Custom meme generation
- Autonomous content posting
- Configurable behavior and posting schedules

## 🚀 Getting Started

1. Clone the repository:
```bash
git clone https://github.com/daiana-safeai/daiana.git
cd daiana
```

2. Copy `.env.example` to `.env` and configure your environment variables:
```bash
cp .env.example .env
```
Edit `.env` with your API keys and configuration settings

3. Install dependencies:
```bash
pnpm install
```

4. Start the agent:
```bash
pnpm start
```

5. Start the web interface:
```bash
cd web
pnpm install
vite preview
```

Alternatively, you can run Daiana in Docker:
```bash
docker compose up -d
```

## ⚙️ Configuration Options

- `TELEGRAM_BOT_TOKEN`: Telegram bot token
- `VENICE_API_KEY`: Venice API key
- `TWITTER_USERNAME`: Twitter account username
- `TWITTER_EMAIL`: Email associated with Twitter account
- `TWITTER_PASSWORD`: Password for Twitter account
- `POST_INTERVAL_MIN`: Minimum minutes between twitter posts
- `POST_INTERVAL_MAX`: Maximum minutes between twitter posts
- `TWITTER_DRY_RUN`: Set to true to simulate twitter posting without actually tweeting

## 🔄 Future Plans

- SAFE wallet integration for treasury management
- Proposal validation and monitoring
- DeFi portfolio optimization
- Advanced governance analytics
- Enhanced security features

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## 📜 License

This project is licensed under the MIT License. See the [LICENSE file](LICENSE) for details.

Developed for the [SAFE Agentathon 2025](https://safe.global/ai)

## 📞 Contact

For any questions or support, please contact us at [hi@daiana.live](mailto:hi@daiana.live)