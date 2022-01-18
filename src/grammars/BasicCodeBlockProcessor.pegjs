start = note

note =
    config:(
        config:(!Config line:MiscLine {return line})*
        Config
        { return config }
    )?

    front:(!FrontBack line:MiscLine {return line})+
    FrontBack?

    back:(line: MiscLine {return line})*
    {
        console.log(back)
        return {
            "type": "note",
            "config": config ? linesToStr(config) : null,
            "front": linesToStr(front),
            "back": linesToStr(back) || null,
            "location": location()
        }
    }

ConfigSeparator = '---'
Config = ConfigSeparator _* Newline

FrontBackSeparator = '==='
FrontBack = FrontBackSeparator _* Newline?
