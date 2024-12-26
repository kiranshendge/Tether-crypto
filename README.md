# Cryptocurrency Data Pipeline

## Project Overview

This project fetches prices for the top 5 cryptocurrencies from the top 3 exchanges using the CoinGecko API. It calculates the average prices and stores the data using Hypercore and Hyperbee. The data can be accessed via Hyperswarm RPC.

## Installation

1. **Clone the repository:**

   ```bash
   git clone <repository_url>
   cd crypto-data-pipeline
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   ```

3. **Install HyperDHT globally and run it in bootstrap mode:**
   ```bash
   npm install -g hyperdht
   hyperdht --bootstrap --host 127.0.0.1 --port 30001
   ```

## Usage

1. **Start the data collection server:**

   ```bash
   node src/main.js
   ```

2. **Run the client to fetch data:**
   ```bash
   node src/client.js
   ```
