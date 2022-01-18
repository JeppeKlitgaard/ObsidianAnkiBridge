start = (note / MiscLine)*

note =
    config:(
        config:(!Config line:MiscLine {return line})*
        Config
        { return config }
    )?
    front:(!FrontBack line:MiscLine {return line})+
    back:(
        FrontBack
        back:MiscLine*
        { return back }
    )?
    {
        return {
            "config": config ? linesToStr(config) : null,
            "front": linesToStr(front),
            "back": back ? linesToStr(back) : null,
        }
    }

ConfigSeparator = '---'
Config = ConfigSeparator _* Newline

FrontBackSeparator = '==='
FrontBack = FrontBackSeparator _* Newline
