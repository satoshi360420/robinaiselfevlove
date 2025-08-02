
# ROBIN™ — The Civic Intelligence Engine  
**Author:** Sirin Sanguansin  
**First Public Use:** Q1 2025 (unpublished dev); Structured Deployment: July 2025  
**Version:** 1.0  
---

## 1. Abstract

ROBIN is a modular AI-driven multi-agent system designed to augment human decision-making in civic, political, legal, and intelligence domains. Unlike lab-based AI agent platforms focused on scientific or biomedical workflows, ROBIN operates in the real world: extracting intelligence from open data, advising on national legislation, monitoring cyber threats, and supporting strategic political campaigns.

---

## 2. Origin and Timeline

| Date | Milestone | Evidence |
|------|-----------|----------|
| Jan–Mar 2025 | Design of multi-agent voice-controlled planner | Internal planning notes |
| Apr 2025 | Role routing logic and IndexedDB fallback discussed | Voice transcripts, notes |
| May 2025 | Precedes any public GitHub reference to Robin agents by biotech labs | ChatGPT logs |
| Jul 4 2025 | Robin Control Panel and folder structure finalized | Project tree screenshots |
| Jul 6–10 2025 | GODMODE version with 6 modular agents and Firebase+Cloud Run backend | Firebase logs, shell history |
| Jul 20 2025 | Political OSINT and Legislative AI capability integrated | Live testing evidence |

---

## 3. Modular Agent System

| Agent        | Role                                | Model(s)       |
|--------------|-------------------------------------|----------------|
| WiseAgent    | Task planner, agent selector        | Gemini Pro     |
| IntelAgent   | Research and OSINT data pull        | Gemini Flash   |
| CYSSAgent    | Cybersecurity and scam profiling    | Gemini Flash   |
| DraftingAgent| Policy and legal draft generator    | OpenAI GPT-4   |
| CampaignAgent| Message testing and outreach        | Gemini + Search |
| CalendarAgent| Political scheduling and alerts     | IndexedDB + Firestore |

---

## 4. Differentiators

- **Domain Focus**: Civic OS, legislative policy, anti-scam intelligence.
- **Offline-First**: Works with IndexedDB when Firebase/cloud is down.
- **Agent Routing**: Real-time decision tree and prompt planner (WiseAgent).
- **Privacy-Conscious**: Local browser fallback, user-owned memory logs.
- **Voice I/O**: Dictation, mobile-ready interaction via WebKit and gTTS.
- **Thai Political Infrastructure**: Integrated with national datasets.

---

## 5. Architecture Overview

```
User Input (Voice/Text)
        ↓
    WiseAgent
        ↓
+------+-------+--------+
|      |       |        |
Intel  Draft  CYSS   ... etc.
  ↓      ↓      ↓
Memory Stream / UI Display / Voice Output
```

---

## 6. License

MIT License — Free to use, with attribution required.

---

## 7. Trademark

**ROBIN™** — Informal use as of early 2025. Formal application pending via DBD.

---

## 8. Future Roadmap

- Thai parliamentary auto-analysis
- Law interpretation classifier
- Civic-facing mobile app
- Public incident reporting + scam flagging system
