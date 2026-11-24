# Jana episod.json (podcast + cerita) untuk Asrama: Ketukan 3 Kali
import json, subprocess
D='content/2026-11-24-asrama-ketukan-3'
def dur(f): return round(float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0','video/public/'+f])),2)
V=json.load(open(D+'/akn/v.json'))['scenes']
P=json.load(open(D+'/akp/v.json'))['scenes']
pod=[('host','akp_0.wav',P[0]['say']),('cohost','akp_1.wav',P[1]['say']),('host','akp_2.wav',P[2]['say']),
     ('cohost','story/b378p4b.wav','Sebelum kita mulakan cerita, jangan lupa follow.'),('host','story/b378-p5.wav','Baik. Sekarang, kita mulakan kisahnya.')]
t=1.5; lines=[]
for who,v,say in pod:
  d=dur(v); lines.append({'who':who,'from':round(t,2),'to':round(t+d,2),'voice':v,'say':say}); t+=d+0.4
podcast={'duration':round(t+1.0,2),'lines':lines}
SZ={}
from PIL import Image
def sh(img,d,**k):
  if img not in SZ: SZ[img]=Image.open('video/public/story/'+img+'.png').size
  w,h=SZ[img]; x={'image':'story/'+img+'.png','w':w,'h':h,'duration':d}; x.update(k); return x
def n(i,at=0.3): return {'voice':f'akn_{i}.wav','voiceAt':at,'say':V[i]['say'],'voiceSec':dur(f'akn_{i}.wav')}
def C(x,y,z): return {'x':x,'y':y,'zoom':z}
def S(src,at,d=None,vol=0.6,**k):
  o={'src':src,'at':at,'volume':vol}; 
  if d: o['dur']=d
  o.update(k); return o
shots=[
 sh('ak01-asrama',12.6,frm=0,**{'from':C(400,500,1.0),'to':C(560,900,1.2)},fog=0.5,
    glows=[{'x':250,'y':190,'r':140,'color':'#cfd8ff','flicker':0},{'x':760,'y':400,'r':70,'flicker':0.1},{'x':230,'y':850,'r':50,'flicker':0.08}],
    sfx=[S('whoosh',0.1,1.2,0.35)],**n(0,0.6)),
 sh('ak02-radio',11.3,**{'from':C(543,800,1.05),'to':C(560,1000,1.3)},fog=0.1,
    glows=[{'x':590,'y':1060,'r':170,'flicker':0.05},{'x':580,'y':95,'r':120,'color':'#cfe0ff','flicker':0.15}],**n(1)),
 sh('ak03-jam1',5,**{'from':C(600,656,1.0),'to':C(750,560,1.35)},fog=0.05,sfx=[S('clock',0,5,0.5,loop=True,fade=0.4)],**n(2)),
 sh('ak03b-tidur',8.6,**{'from':C(543,750,1.0),'to':C(543,1000,1.2)},fog=0.15,
    glows=[{'x':100,'y':330,'r':160,'color':'#cfd8ff','flicker':0}],sfx=[S('clock',0,8.6,0.25,loop=True,fade=1)]),
 sh('ak04-jam230',4.6,**{'from':C(750,600,1.4),'to':C(720,580,1.6)},fog=0.05,sfx=[S('clock',0,4.6,0.5,loop=True,fade=0.3),S('impact',0.2,2.5,0.3)],**n(3)),
 sh('ak05-kejut',10.7,**{'from':C(600,656,1.0),'to':C(560,600,1.15)},fog=0.05,glows=[{'x':320,'y':80,'r':130,'color':'#cfd8ff','flicker':0}]),
 sh('ak06-locker',13,**{'from':C(600,656,1.0),'to':C(900,700,1.35)},fog=0.05,
    glows=[{'x':990,'y':700,'r':200,'at':10.6,'flicker':0.03},{'x':990,'y':700,'r':70,'color':'#fff6d8','at':10.6,'flicker':0.03}],
    sfx=[S('knock',4.6,0.15,0.25),S('knock',7.6,0.15,0.3),S('knock',8.3,0.15,0.3),S('knock',10.5,0.15,0.35)],**n(4)),
 sh('ak07-bayang',10.2,**{'from':C(500,700,1.0),'to':C(800,700,1.45)},fog=0.05,**n(5)),
 sh('akL01-dorm',5.3,**{'from':C(150,830,2.6),'to':C(150,820,2.8)},fog=0.05,
    glows=[{'x':160,'y':800,'r':120,'flicker':0.02}],sfx=[S('whoosh',0,0.6,0.5)]),
 sh('ak09-dorm',4.2,**{'from':C(543,700,1.0),'to':C(800,600,1.25)},fog=0.05,glows=[{'x':720,'y':770,'r':120,'flicker':0.04}],
    sfx=[S('door_open',3.4,1.2,0.6)],**n(6)),
 sh('ak10-koridor',5.9,**{'from':C(512,900,1.0),'to':C(560,700,1.25)},fog=0.15,glows=[{'x':600,'y':780,'r':110,'flicker':0.05}],
    sfx=[S('run',0.3,5,0.18,fade=1)]),
 sh('akL03-tandas',12.5,**{'from':C(470,900,1.0),'to':C(500,1000,1.25)},fog=0.2,shake={'at':4.2,'dur':0.6,'amp':12},
    streaks=[{'at':4.15,'dur':0.4,'y':900}],sfx=[S('door_open',0,1.2,0.4),S('whoosh',4.0,0.6,0.9),S('impact',4.2,2.5,0.6)],**n(7)),
 sh('ak11-makhluk',4.6,**{'from':C(250,650,1.6),'to':C(260,640,1.65)},fog=0.1,**n(8)),
 sh('ak11-makhluk',8.9,**{'from':C(260,640,1.65),'to':C(620,760,2.1)},toAt=3.2,fog=0.1,sfx=[S('impact',3.3,2.5,0.5)]),
 sh('akC03-makhluk',7.4,**{'from':C(590,960,2.4),'to':C(470,800,1.0)},toAt=5.5,fog=0.05,sfx=[S('impact',0,2.5,0.6)],**n(9,0.15)),
 sh('akC03-makhluk',2.6,**{'from':C(470,800,1.0),'to':C(590,960,2.9)},toAt=0.45,fog=0.0,shake={'at':0,'dur':1.4,'amp':26},
    sfx=[S('whoosh',0,0.6,1.0),S('scream',0.1,2.0,0.7),S('impact',0.3,2.3,1.0)]),
 sh('ak12-lari',2.8,**{'from':C(512,800,1.05),'to':C(560,760,1.3)},fog=0.0,shake={'at':0,'dur':2.8,'amp':10},sfx=[S('run',0,2.8,0.9)]),
 sh('ak13-masuk',2.4,**{'from':C(512,800,1.0),'to':C(800,750,1.3)},fog=0.0,shake={'at':1.5,'dur':0.5,'amp':16},sfx=[S('door_close',1.4,1,1.0)],**n(10,0.2)),
 sh('ak14-kejut',4.5,**{'from':C(400,900,1.15),'to':C(450,950,1.3)},fog=0.05,shake={'at':0,'dur':4.5,'amp':4}),
 sh('ak15-bingung',10.5,**{'from':C(543,800,1.0),'to':C(850,700,1.35)},toAt=9,fog=0.05,
    sfx=[S('run',4.2,1.8,0.12,fade=0.8),S('run',6.3,2.0,0.22,fade=0.6),S('run',8.5,2.0,0.35,fade=0.4)],**n(11)),
 sh('ak16-ketuk',5,**{'from':C(850,700,1.4),'to':C(900,650,1.6)},fog=0.05,shake={'at':1.0,'dur':2.3,'amp':9},
    sfx=[S('knock',1.0,0.4,1.0),S('knock',1.9,0.4,1.0),S('knock',2.8,0.4,1.0)],
    captions=[{'text':'TOK!','at':1.0,'sec':0.8},{'text':'TOK! TOK!','at':1.9,'sec':0.8},{'text':'TOK! TOK! TOK!','at':2.8,'sec':2.0}]),
 sh('ak17-selimut',11,**{'from':C(543,674,1.0),'to':C(520,560,1.35)},fog=0.0,sfx=[S('knock',5.4,0.4,0.45),S('knock',7.0,0.4,0.2)],**n(12,0.4)),
 sh('ak03b-tidur',13.2,**{'from':C(543,1000,1.2),'to':C(543,800,1.0)},fog=0.15,
    glows=[{'x':100,'y':350,'r':420,'color':'#ffdca8','flicker':0,'at':7.2},{'x':100,'y':350,'r':200,'color':'#cfd8ff','flicker':0}],**n(13)),
 sh('ak03b-tidur',9.0,**{'from':C(543,900,1.0),'to':C(543,1000,1.25)},fog=0.1,glows=[{'x':100,'y':330,'r':160,'color':'#cfd8ff','flicker':0}],**n(14)),
 sh('akC03-makhluk',5.8,**{'from':C(470,836,1.0),'to':C(590,960,2.0)},toAt=5.5,fog=0.05,shake={'at':0,'dur':0.6,'amp':18},
    sfx=[S('whoosh',0,0.6,0.9),S('impact',0.1,3,0.8)]),
 sh('ak01-asrama',10.5,**{'from':C(543,700,1.2),'to':C(543,700,1.0)},fog=0.4,endCard={'at':7.6},
    sfx=[S('impact',8.4,2.1,0.6)],**n(15)),
]
for s in shots: s.pop('frm',None)
ep={'podcast':podcast,'music':[{'src':'sfx/ambience.wav','volume':0.22}],'story':{'shots':shots}}
json.dump(ep,open(D+'/episod.json','w'),indent=1,ensure_ascii=False)
tot=podcast['duration']+sum(s['duration'] for s in shots)
print('podcast',podcast['duration'],'jumlah',round(tot,1))
# semak suara tak tertindih
t0=0
for i,s in enumerate(shots):
  if 'voice' in s: print(i,s['image'][6:],'mula',round(t0+s['voiceAt'],1),'tamat',round(t0+s['voiceAt']+s['voiceSec'],1))
  t0+=s['duration']
