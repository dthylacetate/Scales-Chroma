# Database ER Design

The database supports practice growth, unlockable visual effects, and theory-to-visual mappings. The first implementation targets SQLite for local development and keeps a path open for PostgreSQL.

## Entity Relationship Diagram

```mermaid
erDiagram
    users ||--o{ practice_records : creates
    users ||--|| exp_statistics : has
    users ||--o{ unlocked_effects : unlocks

    users {
        int id PK
        string username
        string email
        datetime created_at
        int level
        int total_exp
    }

    practice_records {
        int id PK
        int user_id FK
        date practice_date
        int duration_minutes
        int bpm
        string topic
        string notes
        datetime created_at
    }

    exp_statistics {
        int id PK
        int user_id FK
        int total_exp
        int current_streak
        int longest_streak
        datetime updated_at
    }

    theory_visual_mapping {
        int id PK
        string theory_type
        string theory_name
        int tension_level
        string color_hex
        string visual_effect
        float particle_density
    }

    unlocked_effects {
        int id PK
        int user_id FK
        string effect_name
        datetime unlocked_at
        string trigger_condition
    }
```

## Table Notes

### users

Stores profile and aggregate progression state. `total_exp` is duplicated from `exp_statistics` intentionally for fast profile reads; service logic must keep it synchronized.

### practice_records

Stores each practice session. `topic` is the bridge between practice and later skill tree or visual unlock logic.

### exp_statistics

Stores derived growth state for a user, including streaks. Streak calculations must be tested across month, leap-year, and year boundaries.

### theory_visual_mapping

Stores the default mapping between a music theory element and visual parameters. This table gives the visual engine database-backed defaults while keeping live render logic modular.

### unlocked_effects

Stores persistent visual capabilities unlocked through practice. These records alter sandbox rendering power over time.
