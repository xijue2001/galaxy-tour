from pathlib import Path
import re
from html import escape
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Image, KeepTogether
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'output' / 'pdf'
OUT.mkdir(parents=True, exist_ok=True)
pdfmetrics.registerFont(TTFont('Guide', r'C:\Windows\Fonts\msyh.ttc', subfontIndex=0))
pdfmetrics.registerFont(TTFont('GuideBold', r'C:\Windows\Fonts\msyhbd.ttc', subfontIndex=0))
pdfmetrics.registerFontFamily('Guide', normal='Guide', bold='GuideBold', italic='Guide', boldItalic='GuideBold')

styles = {
 'title': ParagraphStyle('title', fontName='GuideBold', fontSize=24, leading=32, textColor=colors.black, spaceAfter=8),
 'meta': ParagraphStyle('meta', fontName='Guide', fontSize=9, leading=15, textColor=colors.HexColor('#606A75'), spaceAfter=14),
 'h1': ParagraphStyle('h1', fontName='GuideBold', fontSize=17, leading=24, textColor=colors.black, spaceBefore=0, spaceAfter=12, keepWithNext=True),
 'h2': ParagraphStyle('h2', fontName='GuideBold', fontSize=11.8, leading=18, textColor=colors.black, spaceBefore=9, spaceAfter=5, keepWithNext=True),
 'body': ParagraphStyle('body', fontName='Guide', fontSize=10, leading=16.5, wordWrap='CJK', textColor=colors.HexColor('#20262C'), spaceAfter=7),
 'item': ParagraphStyle('item', fontName='Guide', fontSize=10, leading=16.5, wordWrap='CJK', leftIndent=10, firstLineIndent=-10, textColor=colors.HexColor('#20262C'), spaceAfter=5),
 'cell': ParagraphStyle('cell', fontName='Guide', fontSize=9.5, leading=15, wordWrap='CJK', textColor=colors.HexColor('#20262C')),
 'caption': ParagraphStyle('caption', fontName='Guide', fontSize=8.4, leading=13, textColor=colors.HexColor('#616B76'), spaceBefore=5, spaceAfter=10),
}

def inline(text):
    text = escape(text)
    text = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', text)
    text = re.sub(r'`(.+?)`', r'<font color="#273D56">\1</font>', text)
    text = re.sub(r'&lt;(https?://.+?)&gt;', r'<link href="\1" color="#244E74">\1</link>', text)
    return text

source = (ROOT / '使用说明.md').read_text(encoding='utf-8')
sections = re.split(r'^## ', source, flags=re.MULTILINE)
story = []

def add_md(lines):
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if not line:
            i += 1
            continue
        if line.startswith('|'):
            table_rows = []
            while i < len(lines) and lines[i].strip().startswith('|'):
                row = [s.strip() for s in lines[i].strip().strip('|').split('|')]
                if not all(re.fullmatch(r':?-+:?', s or ' ') for s in row):
                    table_rows.append([Paragraph(inline(s), styles['cell']) for s in row])
                i += 1
            table = Table(table_rows, colWidths=[100, 395.28], repeatRows=1, hAlign='LEFT')
            table.setStyle(TableStyle([
                ('BACKGROUND',(0,0),(-1,0),colors.HexColor('#E8EEF4')),
                ('GRID',(0,0),(-1,-1),.45,colors.HexColor('#D9D9D9')),
                ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
                ('LEFTPADDING',(0,0),(-1,-1),9),('RIGHTPADDING',(0,0),(-1,-1),9),
                ('TOPPADDING',(0,0),(-1,-1),6),('BOTTOMPADDING',(0,0),(-1,-1),6)
            ]))
            story.extend([table,Spacer(1,8)])
            continue
        if line.startswith('### '):
            story.append(Paragraph(inline(line[4:]), styles['h2']))
        elif line.startswith('# '):
            story.append(Paragraph(inline(line[2:]), styles['title']))
        elif line.startswith('适用版本'):
            story.append(Paragraph(inline(line), styles['meta']))
        elif line.startswith('- '):
            story.append(Paragraph('• '+inline(line[2:]), styles['item']))
        elif re.match(r'\d+\. ', line):
            story.append(Paragraph(inline(line), styles['item']))
        else:
            story.append(Paragraph(inline(line), styles['body']))
        i += 1

add_md(sections[0].splitlines())
for idx, section in enumerate(sections[1:]):
    if idx:
        story.append(PageBreak())
    lines=section.splitlines()
    story.append(Paragraph(inline(lines[0]), styles['h1']))
    # This screenshot documents the current free-exploration controls.
    if idx==1:
        screenshot=ROOT/'screenshots'/'v5'/'free-explore-replay.jpg'
        picture=Image(str(screenshot),width=390,height=219.375,hAlign='LEFT')
        story.append(KeepTogether([picture,Paragraph('自由探索示例 右上重新播放 左上返回银河全景 完成后不再显示进度条',styles['caption'])]))
    add_md(lines[1:])

def page_info(c, doc):
    c.saveState()
    c.setFont('Guide',8)
    c.setFillColor(colors.HexColor('#6F7780'))
    c.drawString(50,26,'银河巡游使用手册   5.1.0')
    c.drawRightString(A4[0]-50,26,str(doc.page))
    c.restoreState()

pdf_path = OUT/'银河巡游使用手册.pdf'
doc = SimpleDocTemplate(str(pdf_path),pagesize=A4,rightMargin=50,leftMargin=50,topMargin=42,bottomMargin=44,title='银河巡游使用手册',author='Galaxy Tour',pageCompression=1)
doc.build(story,onFirstPage=page_info,onLaterPages=page_info)
print(pdf_path)
