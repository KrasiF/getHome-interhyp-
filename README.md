# getHome(interhyp)

## 1. Overview

getHome(interhyp) is an advanced, gamified life simulation platform designed to educate young adults on long-term financial planning and home ownership goals.

The core idea is to turn complex financial decisions—like saving rates, investments, and career changes—into an engaging role-playing experience. Users navigate simulated years, facing life events (powered by Google Gemini), and track their progress toward the ultimate goal: financing their dream home.

The simulation accurately models key dynamics:
* Investment Growth: Stochastic models predict portfolio returns (ETF, Crypto, Cash).
* Life Satisfaction: A psychometric function measures happiness based on income, stress, living space, and social factors.
* Credit Worthiness: The system continuously calculates the maximum affordable loan amount based on current finances.

## 2. Core Technology

* Frontend/Backend: Next.js & TypeScript
* AI: Google Gemini API (Event Generation, Financial Analysis)
* Infrastructure: Docker / Google Cloud Run

## 3. Technical Documentation

For a detailed overview of the governing equations for Life Satisfaction (Tanh Curve), Stochastic Asset Growth (Box-Muller/Normal Distribution), and Household Budgeting:
[Mathematical Modeling of the getHome Framework](./doc/Mathematical-Modeling-of-the-getHome-Framework.pdf)