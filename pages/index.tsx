import type { NextPage } from 'next'
import styles from '../styles/Home.module.css'
import Select, { SingleValue } from 'react-select'
import React, { useEffect, useState } from 'react'
import hljs from 'highlight.js'
import 'highlight.js/styles/a11y-dark.css';
import ReactCardFlip from 'react-card-flip';
import { FaCog, FaQuestionCircle, FaChartBar } from 'react-icons/fa'
import { VscChromeClose } from 'react-icons/vsc'
import ChartDataLabels from 'chartjs-plugin-datalabels';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Align, Anchor } from 'chartjs-plugin-datalabels/types/options'
// import { Align } from 'chartjs-plugin-datalabels/types/options'

const MAX_GUESSES = 7;

enum guess {
  wrong = -1,
  correct = 1,
  unattempted = 0,
}

interface LooseObject {
  [key: string]: any
}

interface Stats {
  1: number,
  2: number,
  3: number,
  4: number,
  5: number,
  6: number,
  7: number,
  "lost": number,
}

interface Info {
  guessState: guess[]
  completed: boolean
  won: boolean
  dateLastFinished: number    // Unix timestamp, used to figure out if streak is lost
  dateLastPlayed: number      // Unix timestamp, used to figure out if state should reset
  streak: number
  highestStreak: number
  stats: Stats
}

const isInfo = (o: any) : o is Info => {
  const i: Info = o
  const boolGuessState = i.guessState.map(guess => guess === -1 || guess === 0 || guess === 1).every(correct => correct)
  const boolStats = ['1', '2', '3', '4', '5', '6', '7', 'lost'].map(key => typeof i.stats[key as keyof Stats] === 'number').every(correct => correct)
  return (typeof i.completed === "boolean" &&
          typeof i.won === 'boolean' &&
          typeof i.dateLastFinished === 'number' &&
          typeof i.dateLastPlayed === 'number' &&
          typeof i.streak === 'number' &&
          typeof i.highestStreak === 'number' &&
          boolStats && boolGuessState)
}

const Home: NextPage = () => {
  const TelemetryDeck = typeof window !== 'undefined' ? require('@telemetrydeck/sdk') : undefined
  const td = typeof window !== 'undefined' ? new TelemetryDeck.TelemetryDeck({ app: '68F10CF1-EBCB-4149-8573-FB46F8C1187B', user: 'anonymous' }) : undefined;
  // td && td.signal({
  //   route: 'win/6',
  // });
  let unsortedProjects: LooseObject = { // Format: projectName: file
    'freeCodeCamp/freeCodeCamp': 'freeCodeCamp',
    'vuejs/vue': 'vue',
    'facebook/react': 'react',
    'tensorflow/tensorflow': 'tensorflow',
    'twbs/bootstrap': 'bootstrap',
    'ohmyzsh/ohmyzsh': 'ohmyzsh',
    'flutter/flutter': 'flutter',
    'microsoft/vscode': 'vscode',
    'torvalds/linux': 'linux',
    'facebook/react-native': 'react-native',
    'electron/electron': 'electron',
    'golang/go': 'go',
    'facebook/create-react-app': 'create-react-app',
    'kubernetes/kubernetes': 'kubernetes',
    'nodejs/node': 'node',
    'vercel/next.js': 'nextjs',
    'angular/angular': 'angular',
    'mrdoob/three.js': 'threejs',
    'microsoft/TypeScript': 'typescript',
    'ant-design/ant-design': 'ant-design',
    'puppeteer/puppeteer': 'puppeteer',
    'mui/material-ui': 'material-ui',
    'tensorflow/models': 'tfmodels',
    'storybookjs/storybook': 'storybook',
    'nvbn/thefuck': 'thefuck',
    'rust-lang/rust': 'rust',
    'django/django': 'django',
    'moby/moby': 'moby',
    'bitcoin/bitcoin': 'bitcoin',
    'genymobile/scrcpy': 'scrcpy',
    'webpack/webpack': 'webpack',
    'opencv/opencv': 'opencv',
    'apple/swift': 'swift',
    'elastic/elasticsearch': 'elasticsearch',
    'hakimel/reveal.js': 'revealjs',
    'netdata/netdata': 'netdata',
    'pallets/flask': 'flask',
    'reduxjs/redux': 'redux',
    'gohugoio/hugo': 'hugo',
    'atom/atom': 'atom',
    'chartjs/Chart.js': 'chartjs',
    'expressjs/express': 'expressjs',
    'gin-gonic/gin': 'gin',
    'jquery/jquery': 'jquery',
    'socketio/socket.io': 'socketio',
    'adam-p/markdown-here': 'markdown-here',
    'keras-team/keras': 'keras',
    'pytorch/pytorch': 'pytorch',
    'shadowsocks/shadowsocks-windows': 'shadowsocks-windows',
    'fatedier/frp': 'frp',
    'redis/redis': 'redis',
    'gatsbyjs/gatsby': 'gatsbyjs',
    'ansible/ansible': 'ansible',
    'elemeFE/element': 'ElemeFE',
    'neovim/neovim': 'neovim',
    'rails/rails': 'rails',
    // 'home-assistant/core': 'home-assistant',
    // 'apache/echarts': 'apache-echarts',
    // 'semantic-Org/Semantic-UI': 'semantic-ui',
    // 'scikit-learn/scikit-learn': 'scikit-learn',
    // 'grafana/grafana': 'grafana',
    // 'ionic-team/ionic-framework': 'ionic-framework',
    // 'spring-projects/spring-framework': 'spring-framework',
    // 'moment/moment': 'moment',
    // 'godotengine/godot': 'godot',
    // 'reactiveX/RxJava': 'RxJava',
    // 'apache/superset': 'apache-superset',
    // 'nestjs/nest': 'nestjs',
    // 'jekyll/jekyll': 'jekyll',
    // 'tesseract-ocr/tesseract': 'tesseract-ocr',
    // 'ageitgey/face_recognition': 'ageitgey-face-recognition',
    // 'soimort/you-get': 'you-get',
    // 'strapi/strapi': 'strapi',
    // 'syncthing/syncthing': 'syncthing',
    // 'meteor/meteor': 'meteor',
    // 'tiangolo/fastapi': 'fastapi',
    // 'scrapy/scrapy': 'scrapy',
    // 'python/cpython': 'cpython',
    // 'junegunn/fzf': 'fzf',
    // 'serverless/serverless': 'serverless',
    // 'prettier/prettier': 'prettier',
    // 'square/okhttp': 'okhttp',
    // 'juliangarnier/anime': 'anime',
    // 'prometheus/prometheus': 'prometheus',
    // 'git/git': 'git',
    // 'yarnpkg/yarn': 'yarn',
    // 'babel/babel': 'babel',
    // 'JetBrains/kotlin': 'kotlin',
    // 'square/retrofit': 'retrofit',
    // 'nuxt/nuxt.js': 'nuxtjs',
    // 'nwjs/nw.js': 'nwjs',
    // 'localstack/localstack': 'localstack',
    // 'gogs/gogs': 'gogs',
    // 'juliaLang/julia': 'julia',
    // 'facebook/jest': 'jest',
    // 'vercel/hyper': 'hyper',
    // 'iamkun/dayjs': 'dayjs',
  };
  var keys = Object.keys(unsortedProjects);
  keys.sort();
  let projects: LooseObject = {}
  for (var i=0; i<keys.length; i++) {
    var key = keys[i];
    // @ts-ignore
    var value = unsortedProjects[key];
    projects[key] = value;
  } 

  const [projectsObj, setProjects] = useState(Object.keys(projects).map(project => (
    {value: project, label: project, disabled: false}
  )));
  const [data, setData] = useState("");
  const [day, setDay] = useState(0)
  const [guesses, setGuesses] = useState(Array<string>());
  const [nGuesses, setNGuesses] = useState(0);
  const [selectVal, setSelectVal] = useState({value: "", label: "", disabled: false});
  const [origCode, setOrigCode] = useState("");
  const [currentProject, setCurrentProject] = useState("");
  const [won, setWon] = useState(false);
  const [guessIsFlipped, setGuessIsFlipped] = useState(new Array(MAX_GUESSES).fill(false))
  const [guessColor, setGuessColor] = useState(new Array(MAX_GUESSES).fill("rgb(165, 144, 45)"))
  const [failed, setFailed] = useState(0)
  const [imported, setImported] = useState(false)
  const [doneBtnTxt, setDoneBtnTxt] = useState(`You ${won ? "won" : "lost"}. Share.`)
  useEffect(() => setDoneBtnTxt(`You ${won ? "won" : "lost"}. Share.`), [won])
  useEffect(() => {
    if (doneBtnTxt !== `You ${won ? "won" : "lost"}. Share.`) {
      setTimeout(() => setDoneBtnTxt(`You ${won ? "won" : "lost"}. Share.`), 1500)
    }
  }, [doneBtnTxt])
  const [saveStatsBtn, setSaveStatsBtn] = useState('Save statistics')
  useEffect(() => {
    if (doneBtnTxt !== 'Save statistics') {
      setTimeout(() => setSaveStatsBtn('Save statistics'), 1500)
    }
  }, [saveStatsBtn])
  const emptyStats: Info = {
    guessState: [
      guess.unattempted,
      guess.unattempted,
      guess.unattempted,
      guess.unattempted,
      guess.unattempted,
      guess.unattempted,
      guess.unattempted
    ],
    completed: false,
    won: false,
    dateLastFinished: 0,
    dateLastPlayed: 0,
    streak: 0,
    highestStreak: 0,
    stats: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
      7: 0,
      lost: 0,
    }
  }
  const [stats, setStats] = useState(emptyStats);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const fossleState = localStorage.getItem('fossle-state')
      if ((stats === emptyStats && fossleState)) {
        let tempState: Info = JSON.parse(fossleState)
        
        let lpd = new Date(tempState.dateLastPlayed)
        let now = new Date()
        tempState.dateLastPlayed = now.getTime()
        lpd = new Date(lpd.getFullYear(), lpd.getMonth(), lpd.getDate()); // Strip away time data
        now = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Strip away time data
        if (now.getTime() - lpd.getTime() >= 1000 * 60 * 60 * 24) { // 1 day or more apart
          tempState.completed = false
          tempState.won = false
          tempState.guessState.fill(guess.unattempted)
          if (now.getTime() - lpd.getTime() >= 1000 * 60 * 60 * 24 * 2) { // 2 days or more apart
            tempState.streak = 0
          }
        } else {
          let nGuessIsFlipped = guessIsFlipped
          let nGuessColor = guessColor
          let newNGuesses = 0;
          tempState.guessState.forEach((g, index) => {
            if (g === guess.wrong) {
              nGuessIsFlipped[index] = true
              ++newNGuesses
            } else if (g === guess.correct) {
              nGuessIsFlipped[index] = true
              nGuessColor[index] = "rgb(68,125,61)"
              ++newNGuesses
            }
          })
          if (tempState.won && tempState.completed) {
            setWon(true)
            // set
          }
          setNGuesses(newNGuesses)
        }
        setStats(tempState)

      } else {
        localStorage.setItem('fossle-state', JSON.stringify(stats))
        // setStats(stats)
        if (imported) {
          setImported(false)
          window.location.reload()
        }
      }
    }
  }, [stats])
  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ChartDataLabels
  );
  const options = {
    indexAxis: 'y' as const,
    elements: {
      bar: {
        borderWidth: 2,
      },
    },
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Guess Distribution',
      },
      datalabels: {
        display: true,
        align: "start" as Align,
        anchor: 'end' as Anchor,
        color: 'white',
        clamp: true,
        offset: 0
      },
    },
    tooltips: {
      enabled: false
    },
    events: [],
  };
  const labels = [1,2,3,4,5,6,7]
  const [graphData, setGraphData] = useState({
    labels,
    datasets: [
      {
        label: 'Guess Distribution',
        data: labels.map((i) => i),
        borderColor: 'rgb(255, 99, 132)', // TODO change this
        backgroundColor: 'rgba(255, 99, 132, 0.5)', // TODO change this
        minBarLength: 28,
      },
    ],
  })
  useEffect(() => {
    if (stats !== emptyStats) {
      let nGraphData = JSON.parse(JSON.stringify(graphData))
      nGraphData.datasets[0].data = labels.map((i) => stats.stats[i as keyof Stats])
      setGraphData(nGraphData)
    }
  }, [stats])

  // TODO: change the date so it is the day I deploy
  useEffect(() => {
    const day = 24 * 60 * 60 * 1000
    let orig_date = new Date(2022, /* Month index (month - 1) */ 3 - 1, 9).getTime();
    let now = new Date().getTime();
    const index = Math.floor(Math.abs((now - orig_date) / day));
    setDay(index + 1)
    setCurrentProject(projectsObj[index % projectsObj.length].value)
  }, [])
  
  useEffect(() => {
    fetch('code_snippets/' + projects[currentProject])
      .then(res => {
        if (!res.ok) {
          setFailed(failed + 1);
        }
        return res
      })
      .then((res) => res.text())
      .then((data) => {
        setOrigCode(data)
        let n = data.split('\n')
        setData(n.slice(0, Math.round(n.length/Math.floor(MAX_GUESSES - nGuesses + 1))).join("\n"))
      })
      .catch(error => console.error(error))
  }, [currentProject, failed]);
  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const target = event.target as typeof event.target & {
      selector: { value: string };
    };

    if (target.selector.value === "") {
      return
    }
    guesses.push(target.selector.value)
    setGuesses(guesses);
    setProjects(projectsObj.map(project => {
      if (project.value === target.selector.value) {
        project.disabled = true;
      }
      return project
    }));
    setSelectVal({value: "", label: "", disabled: true});
    let nStats = JSON.parse(JSON.stringify(stats))
    nStats.dateLastPlayed = new Date().getTime()
    if (target.selector.value == currentProject) {
      setWon(true);
      nStats.guessState[nGuesses] = guess.correct
      nStats.won = true
      nStats.completed = true
      nStats.dateLastFinished = new Date().getTime()
      nStats.streak += 1
      nStats.stats[nGuesses + 1 as keyof Stats] += 1
      if (nStats.streak > nStats.highestStreak) {
        nStats.highestStreak = nStats.streak
      }
    } else if (nGuesses < MAX_GUESSES - 1) {
      nStats.guessState[nGuesses] = guess.wrong
    }
    let nGuessFlipped = guessIsFlipped
    nGuessFlipped[nGuesses] = true
    setGuessIsFlipped(nGuessFlipped)
    setStats(nStats)
    setNGuesses(nGuesses + 1);
  }
  const handleChange = (value: SingleValue<{ value: string; label: string; disabled: boolean; }>) => {
    value && setSelectVal({value: value.value, label: value.label, disabled: value.disabled});
  }

  useEffect(() => {
      if (nGuesses >= MAX_GUESSES) {
        document.getElementById('guesses')?.remove()
        let nStats = JSON.parse(JSON.stringify(stats))
        nStats.completed = true
        nStats.won = false
        if (nStats.streak > nStats.highestStreak) {
          nStats.highestStreak = nStats.streak
        }
        nStats.streak = 0
        nStats.stats.lost += 1
        nStats.dateLastFinished = new Date().getTime()
        setStats(nStats)
        td && td.signal({
          route: 'loss',
        });
      }
      let n = origCode.split('\n')
      setData(n.slice(0, Math.round(n.length/(MAX_GUESSES - nGuesses + 1))).join("\n"))
    },
    [nGuesses]
  )

  useEffect(() => {
    if (won) {
      let newGuessColor = guessColor
      newGuessColor[nGuesses - 1] = "rgb(68,125,61)"
      setGuessColor(newGuessColor)
      document.getElementById('guesses')?.remove();
      td && td.signal({
        route: 'win/' + nGuesses.toString(),
      });
    }
  }, [won])

  const overlayClose = (overlayName: string, event: React.MouseEvent<HTMLElement> | undefined) => {
    if (event) {
      if (!((event.target as HTMLElement).classList[0] === 'btn')) {
        let element = document.getElementById(`overlay-${overlayName}`)
        element ? element.style.display = 'none' : undefined
      }
    } else {
      let element = document.getElementById(`overlay-${overlayName}`)
      element ? element.style.display = 'none' : undefined
    }
  }

  const overlayOpen = (overlayName: string) => {
    let element = document.getElementById(`overlay-${overlayName}`)
    element ? element.style.display = 'block' : undefined
  }


  const shareGame = () => {
    if (typeof window !== 'undefined' && (won || nGuesses >= MAX_GUESSES)) {
      if (window.isSecureContext) {
        const greenSquareEmoji = "🟩";
        const graySquareEmoji = "⬛";
        const yellowSquareEmoji = "🟨";

        let numGuesses = 0;

        const emojis = stats.guessState.map(g => {
          switch (g) {
            case guess.wrong:
              ++numGuesses
              return yellowSquareEmoji
            case guess.unattempted:
              return graySquareEmoji
            case guess.correct:
              ++numGuesses
              return greenSquareEmoji
          }
        })
        let nGuessStr: string;
        if (!won) {
          nGuessStr = "X"
        } else {
          nGuessStr = numGuesses.toString()
        }
        navigator.clipboard.writeText(`Fossle ${day} ${nGuessStr}/${MAX_GUESSES}\n\n${emojis.join("")}`)
        setDoneBtnTxt("Copied to clipboard.")
      }
    }
  }

  const exportGame = () => {
    if (typeof window !== 'undefined' && window.isSecureContext) {
      navigator.clipboard.writeText(Buffer.from(JSON.stringify(stats), 'utf-8').toString('base64'))
      setSaveStatsBtn('Save copied to clipboard')
    }
  }

  const importGame = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const target = event.target as typeof event.target & {
      backup: { value: string };
    };
    try {
      if (typeof window !== 'undefined') {
        window.atob(target.backup.value);
      }
    } catch(e) {
      console.error("Something messed up" + e)
      alert("Hey, you made an input you shouldn't have. Invalid save string")
      return
    }
    const decodedStr = Buffer.from(target.backup.value, 'base64').toString('utf-8')
    try {
      JSON.parse(decodedStr)
    } catch(e) {
      console.error("Something messed up" + e)
      alert("Hey, you made an input you shouldn't have. Invalid save string")
      return
    }
    const decodeObj = JSON.parse(decodedStr)
    if (isInfo(decodeObj)) {
      setStats(decodeObj as Info)
      setImported(true)
      overlayClose('import', undefined)

    } else {
      console.error("Something messed up")
      alert("Hey, you made an input you shouldn't have.")
    }
  }
  
  return (
    <div className={styles.container}>
      <div style={{display: 'flex', justifyContent: 'center', width: "100%", position: "relative", height: '30px', borderBottom: 'solid white 1px', paddingBottom: '4px'}}>
        <span style={{position: 'absolute', left: "5%"}}>
          <h2 style={{display: 'inline-block', margin: "0px 5px 0px 5px", lineHeight: '30px', verticalAlign: "middle"}}><FaCog style={{cursor: "pointer"}} onClick={() => overlayOpen("settings")}/></h2>
        </span>
        <span style={{textAlign: "center", display: "inline-block"}}>
          <h1 style={{display: "inline-block", margin: "0 auto", lineHeight: '30px', verticalAlign: "middle"}}>FOSSLE</h1>
        </span>
        <span style={{position: 'absolute', right: "5%", lineHeight: '30px'}}>
          <h2 style={{display: 'inline-block', margin: "0px 5px 0px 5px", lineHeight: '30px', verticalAlign: "middle"}}><FaChartBar style={{cursor: "pointer"}} onClick={() => overlayOpen("stats")} /></h2>
          <h2 style={{display: 'inline-block', margin: '0px 5px 0px 5px', lineHeight: '30px', verticalAlign: "middle"}}><FaQuestionCircle style={{cursor: "pointer"}} onClick={() => overlayOpen("help")} /></h2>
        </span>
      </div>
      {/* <hr /> */}
      <div style={{display: "table", margin: "0 auto", marginTop: "5px"}}>
        {Array.from(Array(MAX_GUESSES).keys()).map(item => 
          <ReactCardFlip key={item} isFlipped={guessIsFlipped[item]} flipDirection="vertical" containerStyle={{display: "inline-block"}}>
            <div style={{maxHeight: "70px",
                        maxWidth: "70px",
                        height: Math.floor(75/MAX_GUESSES).toString() + 'vw',
                        width: Math.floor(75/MAX_GUESSES).toString() + 'vw',
                        background: "rgb(44, 44, 44)", 
                        margin: "1px",
                        borderRadius: "2px"}} />
            <div style={{maxHeight: "70px",
                        maxWidth: "70px",
                        height: Math.floor(75/MAX_GUESSES).toString() + 'vw',
                        width: Math.floor(75/MAX_GUESSES).toString() + 'vw',
                        background: guessColor[item], 
                        display: "inline-block", 
                        margin: "1px",
                        borderRadius: "2px"}}/>
          </ReactCardFlip>)}
      </div>
      <div style={{margin: "5px", height: "80px"}}>
        <ReactCardFlip isFlipped={won || nGuesses >= MAX_GUESSES} flipDirection="vertical" containerStyle={{height: "100%"}}>
          <form onSubmit={onSubmit} id="guesses" style={{height: "100%", maxHeight: "100%"}}>
            <div>
              <Select
                name="selector"
                options={projectsObj}
                isOptionDisabled={(option) => option.disabled}
                onChange={handleChange}
                value={selectVal}
                theme={(theme) => ({
                  ...theme,
                  borderRadius: 3,
                  colors: {
                  ...theme.colors,
                    text: 'white',
                    neutral20: '#aaaaaa',
                    primary25: '#303030',
                    primary: '#dddddd99',
                    neutral0: '#202020',
                    neutral80: '#efefef',
                    primary50: '#444444'
                  },
                  spacing: {
                    ...theme.spacing,
                    menuGutter: 1,
                    controlHeight: 1
                  }
                })}
              />
            </div>
            <div style={{textAlign: "center", margin: "5px 0px 5px 0px"}}>
              <button style={{margin: "0 auto", width: "50%"}} type="submit">Submit guess</button>
            </div>
          </form>
          <form onSubmit={event => { event.preventDefault(); shareGame() }} id="guesses" style={{height: "100%", maxHeight: "100%"}}>
            <div>
              <Select
                name="selector"
                isDisabled
                options={projectsObj}
                isOptionDisabled={(option) => option.disabled}
                onChange={handleChange}
                value={{value: currentProject, label: `Answer: ${(won || nGuesses >= MAX_GUESSES - 1) && currentProject}`, disabled: false}}
                theme={(theme) => ({
                  ...theme,
                  borderRadius: 3,
                  colors: {
                  ...theme.colors,
                    text: 'white',
                    neutral20: '#aaaaaa',
                    primary25: '#303030',
                    primary: '#dddddd99',
                    neutral0: '#202020',
                    neutral80: '#efefef',
                    primary50: '#444444',
                    neutral5: '#555555'
                  },
                  spacing: {
                    ...theme.spacing,
                    menuGutter: 1,
                    controlHeight: 1
                  }
                })}
              />
            </div>
            <div style={{textAlign: "center", margin: "5px 0px 5px 0px"}}>
              <button className="" style={{margin: "0 auto", width: "50%"}} type="submit">{doneBtnTxt}</button>
            </div>
          </form>
        </ReactCardFlip>
      </div>
      
      <div style={{overflowY: "scroll", height:"70vh", borderRadius: "10px", margin:"0px", padding:"0px"}}>
        <pre style={{margin:"0px"}}>
          <code style={{margin:"0px", padding:"5px", height:"100%", fontSize: "12pt"}} dangerouslySetInnerHTML={{__html: hljs.highlightAuto(data).value}} className="hljs">
          </code>
        </pre>
      </div>
      
      <p>Note: Sometime I will remove imports or rename variables to make it less obvious what project something is in. This code will not compile.</p>
      <div id="overlay-help" onClick={() => overlayClose("help", undefined)} style={{display: 'none'}}>
        <div style={{position: "fixed", top: "0", bottom: "0", left: "0", right: "0", display: 'flex', background: 'rgb(0,0,0,0.5)', textAlign: 'center', height: "100%", width: "100%", alignItems: "center", justifyContent: "center"}}>
          <div style={{
                    display: 'block',
                    minWidth: "300px",
                    width: "40vw",
                    minHeight: "225",
                    borderRadius: "10px",
                    background: "#222222",
                    textAlign: 'left',
                    padding: '10px'}}>
            <h3 style={{margin: '0px'}}><VscChromeClose style={{cursor: "pointer"}} /></h3>
            <p>Simply select the popular open source project that you think today&apos;s code is from. There is a new puzzle every day and you have {MAX_GUESSES.toString()} guesses before you fail.</p>
            <p>The colors really mean nothing. Yellow means your guess was wrong, gray means no guess has been made for that attempt, and green means you got it right.</p>
            <p>More and more code will slowly reveal itself as you fail.</p>
            <p>Yeah, this really isn&apos;t a complex game so just start playing :)</p>
          </div>
        </div>
      </div>

      <div id="overlay-stats" onClick={() => overlayClose("stats", undefined)} style={{display: 'none'}}>
        <div style={{position: "fixed", top: "0", bottom: "0", left: "0", right: "0", display: 'flex', background: 'rgb(0,0,0,0.5)', textAlign: 'center', height: "100%", width: "100%", alignItems: "center", justifyContent: "center"}}>
          <div style={{
                    display: 'block',
                    minWidth: "300px",
                    // width: "40vw",
                    minHeight: "225",
                    borderRadius: "10px",
                    background: "#222222",
                    textAlign: 'left',
                    padding: '10px'}}>
            <h3 style={{margin: '0px'}}><VscChromeClose style={{cursor: "pointer"}} /></h3>
            <div style={{display: 'inline-block', margin: "0px 10px"}}>
              <div style={{textAlign: 'center'}}>
                <h1 style={{width: "5ch", margin: '0'}}>{Object.values(stats.stats).reduce((old, b) => old + b).toString()}</h1>
              </div>
              <div style={{display: 'flex', justifyContent: 'center'}}>
                <h4 style={{margin: '0'}}><h1 style={{width: '5ch', margin: "0"}}/>Games played</h4>
              </div>
            </div>
            <div style={{display: 'inline-block', margin: "0px 10px"}}>
              <div style={{textAlign: 'center'}}>
                <h1 style={{width: "3ch", margin: '0'}}>{Math.round((Object.values(stats.stats).reduce((old, b) => old + b) - stats.stats.lost)/(Object.values(stats.stats).reduce((old, b) => old + b)) * 100).toString()}</h1>
              </div>
              <div style={{display: 'flex', justifyContent: 'center'}}>
                <h4 style={{margin: '0'}}>Win %</h4>
              </div>
            </div>
            <div style={{display: 'inline-block', margin: "0px 10px"}}>
              <div style={{textAlign: 'center'}}>
                <h1 style={{width: "5ch", margin: '0'}}>{stats.streak}</h1>
              </div>
              <div style={{display: 'flex', justifyContent: 'center'}}>
                <h4 style={{margin: '0'}}>Current Streak</h4>
              </div>
            </div>
            <div style={{display: 'inline-block', margin: "0px 10px"}}>
              <div style={{textAlign: 'center'}}>
                <h1 style={{width: "5ch", margin: '0'}}>{stats.highestStreak}</h1>
              </div>
              <div style={{display: 'flex', justifyContent: 'center'}}>
                <h4 style={{margin: '0'}}>Highest Streak</h4>
              </div>
            </div>
            <Bar options={options} data={graphData} />
          </div>
        </div>
      </div>

      <div id="overlay-settings" onClick={(event) => overlayClose("settings", event)} style={{display: 'none'}}>
        <div style={{position: "fixed", top: "0", bottom: "0", left: "0", right: "0", display: 'flex', background: 'rgb(0,0,0,0.5)', textAlign: 'center', height: "100%", width: "100%", alignItems: "center", justifyContent: "center"}}>
          <div style={{
                    display: 'block',
                    minWidth: "300px",
                    width: "40vw",
                    minHeight: "225",
                    borderRadius: "10px",
                    background: "#222222",
                    textAlign: 'left',
                    padding: '10px'}}>
            <h3 style={{margin: '0px'}}><VscChromeClose style={{cursor: "pointer"}} /></h3>
            <div style={{padding: "5px"}}><button className='btn' onClick={() => exportGame()}>{saveStatsBtn}</button></div>
            <div style={{padding: "5px"}}><button className='btn' onClick={() => overlayOpen('import')}>Restore statistics</button></div>
          </div>
        </div>
      </div>

      <div id="overlay-import" style={{display: 'none'}}>
        <div style={{position: "fixed", top: "0", bottom: "0", left: "0", right: "0", display: 'flex', background: 'rgb(0,0,0,0.5)', textAlign: 'center', height: "100%", width: "100%", alignItems: "center", justifyContent: "center"}}>
          <div style={{
                    display: 'block',
                    minWidth: "300px",
                    width: "40vw",
                    minHeight: "225",
                    borderRadius: "10px",
                    background: "#222222",
                    textAlign: 'left',
                    padding: '10px'}}>
            <h3 style={{margin: '0px'}}><VscChromeClose onClick={event => overlayClose("import", undefined)} style={{cursor: "pointer"}} /></h3>
            <p>If you do this, you will lose all of your current data! Please enter the backup string and confirm your choice!</p>
            <form  onSubmit={importGame}>
              <div style={{margin: "10px"}}><input style={{width: "100%", padding: "10px", border: "none", color: "white", background: "#555555"}} placeholder="Backup string..." name="backup" /></div>
              <button style={{width: "100%", "background": "#ff4333"}} type="submit">Press this if you are CONFIDENT you want to do this.</button>
            </form>
            {/* <div style={{padding: "5px"}}><button className='btn' onClick={() => exportGame()}>{saveStatsBtn}</button></div>
            <div style={{padding: "5px"}}><button className='btn' onClick={() => console.log()}>Restore statistics</button></div> */}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
