start = (note / MiscLine)*

note =
    AnkiStart _* Newline
    config:AnkiConfigCodeBlock?
    front:(!(AnkiMiddle _* Newline) line:MiscLine {return line})*
    AnkiMiddle _* Newline
    back:(!(AnkiEnd _* Newline?) line:MiscLine {return line})*
    AnkiEnd _* Newline?
    {
        return {
            "type": "note",
            "config": config,
            "front": linesToStr(front),
            "back": linesToStr(back),
            "location": location()
        }
    }
