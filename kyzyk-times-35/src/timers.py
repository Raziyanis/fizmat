"""Add click-started countdown animations to slides containing TIMER_* shapes."""
import sys, json, re
from pptx import Presentation
from lxml import etree

path = sys.argv[1]
prs = Presentation(path)
P = "http://schemas.openxmlformats.org/presentationml/2006/main"

def build(bar, start, digits, up, secs):
    ids = iter(range(3, 10000))
    eff = []
    bld = []
    def ctn():
        return next(ids)
    def setvis(spid, val, delay, cls, grp):
        a, b = ctn(), ctn()
        preset = 'presetID="1" presetClass="%s" presetSubtype="0"' % cls
        return (f'<p:par><p:cTn id="{a}" {preset} fill="hold" grpId="{grp}" nodeType="withEffect">'
                f'<p:stCondLst><p:cond delay="{delay}"/></p:stCondLst><p:childTnLst>'
                f'<p:set><p:cBhvr><p:cTn id="{b}" dur="1" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst></p:cTn>'
                f'<p:tgtEl><p:spTgt spid="{spid}"/></p:tgtEl><p:attrNameLst><p:attrName>style.visibility</p:attrName></p:attrNameLst></p:cBhvr>'
                f'<p:to><p:strVal val="{val}"/></p:to></p:set></p:childTnLst></p:cTn></p:par>')
    ms = secs * 1000
    # bar wipe-out
    a, b, c = ctn(), ctn(), ctn()
    eff.append(f'<p:par><p:cTn id="{a}" presetID="22" presetClass="exit" presetSubtype="2" fill="hold" grpId="0" nodeType="clickEffect">'
               f'<p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>'
               f'<p:animEffect transition="out" filter="wipe(right)"><p:cBhvr><p:cTn id="{b}" dur="{ms}"/><p:tgtEl><p:spTgt spid="{bar}"/></p:tgtEl></p:cBhvr></p:animEffect>'
               f'<p:set><p:cBhvr><p:cTn id="{c}" dur="1" fill="hold"><p:stCondLst><p:cond delay="{ms - 1}"/></p:stCondLst></p:cTn>'
               f'<p:tgtEl><p:spTgt spid="{bar}"/></p:tgtEl><p:attrNameLst><p:attrName>style.visibility</p:attrName></p:attrNameLst></p:cBhvr>'
               f'<p:to><p:strVal val="hidden"/></p:to></p:set></p:childTnLst></p:cTn></p:par>')
    bld.append(f'<p:bldP spid="{bar}" grpId="0" animBg="1"/>')
    if digits:
        eff.append(setvis(start, "hidden", 1000, "exit", 0))
        bld.append(f'<p:bldP spid="{start}" grpId="0" animBg="1"/>')
        for k, spid in sorted(digits.items(), reverse=True):
            t_on = (secs - k) * 1000
            eff.append(setvis(spid, "visible", t_on, "entr", 0))
            eff.append(setvis(spid, "hidden", t_on + 1000, "exit", 1))
            bld.append(f'<p:bldP spid="{spid}" grpId="0" animBg="1"/><p:bldP spid="{spid}" grpId="1" animBg="1"/>')
    else:
        eff.append(setvis(start, "hidden", ms, "exit", 0))
        bld.append(f'<p:bldP spid="{start}" grpId="0" animBg="1"/>')
    eff.append(setvis(up, "visible", ms, "entr", 0))
    bld.append(f'<p:bldP spid="{up}" grpId="0" animBg="1"/>')
    g1, g2 = ctn(), ctn()
    xml = (f'<p:timing xmlns:p="{P}"><p:tnLst><p:par><p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst>'
           f'<p:seq concurrent="1" nextAc="seek"><p:cTn id="2" dur="indefinite" nodeType="mainSeq"><p:childTnLst>'
           f'<p:par><p:cTn id="{g1}" fill="hold"><p:stCondLst><p:cond delay="indefinite"/></p:stCondLst><p:childTnLst>'
           f'<p:par><p:cTn id="{g2}" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>'
           + "".join(eff) +
           '</p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par>'
           '</p:childTnLst></p:cTn><p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst>'
           '<p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst></p:seq>'
           '</p:childTnLst></p:cTn></p:par></p:tnLst><p:bldLst>' + "".join(bld) + '</p:bldLst></p:timing>')
    return etree.fromstring(xml)

def logo_fade(spid):
    xml = (f'<p:timing xmlns:p="{P}"><p:tnLst><p:par><p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst>'
           f'<p:seq concurrent="1" nextAc="seek"><p:cTn id="2" dur="indefinite" nodeType="mainSeq"><p:childTnLst>'
           f'<p:par><p:cTn id="3" fill="hold"><p:stCondLst><p:cond delay="indefinite"/><p:cond evt="onBegin" delay="0"><p:tn val="2"/></p:cond></p:stCondLst><p:childTnLst>'
           f'<p:par><p:cTn id="4" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>'
           f'<p:par><p:cTn id="5" presetID="10" presetClass="entr" presetSubtype="0" fill="hold" nodeType="afterEffect"><p:stCondLst><p:cond delay="300"/></p:stCondLst><p:childTnLst>'
           f'<p:set><p:cBhvr><p:cTn id="6" dur="1" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst></p:cTn><p:tgtEl><p:spTgt spid="{spid}"/></p:tgtEl><p:attrNameLst><p:attrName>style.visibility</p:attrName></p:attrNameLst></p:cBhvr><p:to><p:strVal val="visible"/></p:to></p:set>'
           f'<p:animEffect transition="in" filter="fade"><p:cBhvr><p:cTn id="7" dur="1500"/><p:tgtEl><p:spTgt spid="{spid}"/></p:tgtEl></p:cBhvr></p:animEffect>'
           f'</p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par>'
           f'</p:childTnLst></p:cTn><p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst>'
           f'<p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst></p:seq>'
           f'</p:childTnLst></p:cTn></p:par></p:tnLst></p:timing>')
    return etree.fromstring(xml)

def put(root, timing):
    for old in root.findall(f"{{{P}}}timing"):
        root.remove(old)
    ext = root.find(f"{{{P}}}extLst")
    if ext is not None:
        ext.addprevious(timing)
    else:
        root.append(timing)

n = 0
for idx, slide in enumerate(prs.slides, 1):
    names = {sh.name: sh.shape_id for sh in slide.shapes}
    if "LOGO_ANIM" in names:
        put(slide._element, logo_fade(names["LOGO_ANIM"]))
    if "TIMER_BAR" not in names:
        continue
    digits = {int(k[8:]): v for k, v in names.items() if k.startswith("TIMER_D_")}
    secs = max(digits) + 1 if digits else None
    if secs is None:
        # read label from TIMER_START text, e.g. "4:00" or "1:00"
        sh = [s for s in slide.shapes if s.name == "TIMER_START"][0]
        m, s_ = sh.text_frame.text.split(":")
        secs = int(m) * 60 + int(s_)
    timing = build(names["TIMER_BAR"], names["TIMER_START"], digits, names["TIMER_UP"], secs)
    root = slide._element
    for old in root.findall(f"{{{P}}}timing"):
        root.remove(old)
    ext = root.find(f"{{{P}}}extLst")
    if ext is not None:
        ext.addprevious(timing)
    else:
        root.append(timing)
    n += 1
prs.save(path)
print("timers wired:", n)
