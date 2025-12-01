# Historia zmian

Wszystkie istotne zmiany w projekcie będą dokumentowane w tym pliku.

Format oparty na [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
projekt stosuje [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.1] - 2025-12-01

### Zmieniono

- Zaktualizowano ikonę aplikacji w celu łatwiejszego rozróniania 

---

## [1.1.0] - 2025-12-01

### Dodano

**Rozszerzona konsola debugowania**
- 5 zakładek: Console, Performance, State, Network, Timeline
- REPL / Paleta komend do wykonywania poleceń i JavaScript
- Zakładka Performance: metryki pamięci, statystyki IPC
- Zakładka State: inspekcja localStorage, konfiguracji, stanu okna
- Zakładka Network: monitorowanie żądań fetch w czasie rzeczywistym
- Zakładka Timeline: wizualizacja wydarzeń w czasie
- Filtry okien dla wsparcia wielu okien
- Wbudowane komendy: help, clear, export, filter:X, stats, scroll

**Ulepszenia systemu**
- Hook useTheme oparty na zdarzeniach (bez pollingu)
- Cache API GitHub z 15-minutowym TTL
- Przycisk odświeżania w historii wydań
- Wskaźnik cache z odliczaniem czasu
- Rejestr okien dla logowania wielu okien
- Interceptor sieciowy do śledzenia żądań fetch
- 4 nowe kategorie logów: perf, network, state, lifecycle

### Poprawiono

- Odstęp między przyciskiem odświeżania a przyciskiem zamknięcia dialogu
- Pozycjonowanie tooltipa w dialogu historii zmian

---

## [1.0.0] - 2025-12-01

### Wypalarka przeniesiona do osobnej aplikacji

Funkcjonalność wypalania napisów ASS do plików wideo została przeniesiona z **AG-SubEditor** do dedykowanej aplikacji **AG-Wypalarka**.

### Dlaczego ta zmiana?

Przeniesienie Wypalarki do osobnej aplikacji pozwala na:
- Lepsze skupienie AG-SubEditor na edycji napisów
- Niezależne aktualizacje wypalarki
- Mniejszy rozmiar instalatora AG-SubEditor
- Łatwiejsze utrzymanie reszty projektów

### Dodano

**Podstawowe funkcje**
- Profesjonalne wypalanie napisów ASS do plików wideo
- Tryb pojedynczego pliku z intuicyjnym interfejsem
- Tryb kolejki do przetwarzania wielu plików
- Przeciągnij i upuść z automatycznym parowaniem plików po nazwie

**Kodowanie i przetwarzanie**
- Integracja FFmpeg z automatycznym pobieraniem i instalacją
- Akceleracja GPU NVIDIA NVENC dla szybszego kodowania
- Tryby jakości: Bitrate (VBR) i Stała Jakość (CQ)
- Konfigurowalne presety bitrate (2-20 Mbps) z opcją własną
- Śledzenie postępu w czasie rzeczywistym (ETA, FPS, prędkość, bitrate)
- Rozwijane logi FFmpeg do monitorowania procesu

**System kolejki**
- Przetwarzanie z zarządzaniem kolejką
- Automatyczne parowanie plików wideo i napisów po nazwie
- Dialog dla niesparowanych plików do ręcznego wyboru napisów
- Funkcja wstrzymania/wznowienia kolejki ( kodowanie pliku od 0 ffmep nie wspiera wstrzymywania )
- Statystyki kolejki (oczekujące, przetwarzane, ukończone, błędy)

**Interfejs użytkownika**
- Pierścień postępu z procentem i ETA
- Pasek statystyk z metrykami kodowania w czasie rzeczywistym
- Monitorowanie miejsca na dysku z ostrzeżeniami
- Wykrywanie konfliktów plików wyjściowych z automatycznym przemianowaniem
- Modal ustawień z konfiguracją kodowania
- Wykrywanie i wyświetlanie statusu GPU

**System**
- Automatyczne aktualizacje przez GitHub Releases
- Polskie i angielskie tłumaczenie
- Wsparcie motywów jasny/ciemny/systemowy
- Tryb debugowania z osobnym oknem konsoli
- Kompleksowa obsługa błędów

---

## Szablon notatek wydania

Podczas tworzenia wydań na GitHub, użyj poniższego formatu dla notatek. Będą one wyświetlane w oknie dialogowym aktualizacji.

### Przykład (do skopiowania)

```markdown
## Co nowego w v1.1.0

### Nowe funkcje
- **Nowa funkcja** - Opis nowej funkcjonalności
- **Skróty klawiszowe** - Naciśnij `Ctrl+K` aby otworzyć paletę komend

### Ulepszenia
- Szybszy czas uruchamiania
- Lepsze zarządzanie pamięcią

### Poprawki błędów
- Naprawiono awarię przy otwieraniu plików ze znakami specjalnymi
- Rozwiązano problem z zapisywaniem ustawień

### Uwagi
Ta aktualizacja wymaga ponownego uruchomienia.
```

---

## Publikowanie wydania na GitHub

1. Przejdź do strony **Releases** repozytorium
2. Kliknij **Draft a new release**
3. Utwórz nowy tag (np. `v1.0.0`)
4. Ustaw tytuł wydania (np. `v1.0.0 - Pierwsza wersja`)
5. Wklej notatki wydania w opisie
6. Dołącz zbudowane instalatory (z folderu `release/`)
7. Kliknij **Publish release**

Auto-updater automatycznie wykryje nowe wydanie i wyświetli okno aktualizacji użytkownikom.
