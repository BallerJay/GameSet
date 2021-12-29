; window.onload = function () {
  function $(element) {
    return document.querySelector(element)
  }

  // 获取样式使用最终值的函数
  function getStyle(ele, attr) {
    var res = null;
    // 兼容性代码
    if (ele.currentStyle) {
      res = ele.currentStyle[attr]
    } else {
      res = window.getComputedStyle(ele,null)[attr]
    }
    return parseFloat(res)
  }


  let myPlane = $(".myPlane"),
    bulletsP = $(".bullets"), //子弹的父元素
    enemysP = $(".enemys"), // 敌机的父元素
    game = $(".wrap"),
    gameEnter = $(".enterGame"),
    gameStart = $('.startGame')
    s = $('.scores').firstElementChild.firstElementChild;

  let gameStatus = false;   // 游戏状态
  let timer = null; // 创建子弹的定时器
  let EneTimer = null; // 创建敌机的定时器
  let bgTimer = null; // 背景图运动的计数器
  let bgPositionY = 0; // 背景图y轴的值
  let score = 0;// 游戏分数

  // 获取需要使用到的元素样式
  // 1. 获取游戏界面的宽高
  let gameW = getStyle(game, 'width'),
    gameH = getStyle(game, 'height');
  // 2. 获取游戏界面的左、上外边距
  let gameML = getStyle(game, 'marginLeft'),
    gameMT = getStyle(game, 'marginTop');
  // 3. 获取己方飞机的宽高
  let myPlaneW = getStyle(myPlane, 'width'),
    myPlaneH = getStyle(myPlane, 'height');
  	// 4、子弹的宽高
	var bulletW = 6
	,	bulletH = 14;
  
  let startBtn = $('.startGame').children[0]


  // 为开始游戏按钮注册点击事件
  startBtn.onclick = function () {
    this.parentNode.style.display = 'none' // 隐藏开始游戏界面
    $('.enterGame').style.display = 'block' // 显示游戏界面
    // 给当前的文档添加键盘事件
    document.onkeyup = function (e) {
      var e = e || window.event;
      // 获取按下键盘事件的值
      var keyVal = e.code;
      // 摁下空格键开始游戏
      if (keyVal === 'Space') {
        if (!gameStatus) {
          // 开始游戏
          this.onmousemove = myPlaneMove;
          // 开始创建子弹,实现设计
          shot()
          // 出现敌机
          appearEnemy()
          bgMove() //实现开始游戏之后，背景图的运动
          // 子弹的继续运动
          if(bulletsP.children.length != 0) reStartAll(bulletsP.children,1)
          // 敌机的继续运动
          if(enemysP.children.length != 0) reStartAll(enemysP.children)
        } else {
          // 暂停游戏
          this.onmousemove = null
          // 清除创建子弹的定时器
          clearInterval(timer)
          timer = null
          // 清除创建敌机的定时器
          clearInterval(EneTimer)
          EneTimer = null
          // 清除所有敌机的运动和所有子弹的运动定时器
          clearAll(bulletsP.children)
          clearAll(enemysP.children)
          // 清除背景图的移动
          clearInterval(bgTimer)
          bgTimer = null
        }
          gameStatus = !gameStatus

      }
    }
  }

  // 己方飞机的移动函数
  function myPlaneMove(event) {
    let e = event || window.event;
    // 获取鼠标移动时的位置
    let mouse_x = e.x || e.pageX,
      mouse_y = e.y || e.pageY;

    // 计算得到鼠标移动时己方飞机的左、上边距
    let last_myPlane_left = mouse_x - gameML - myPlaneW / 2;
    let last_myPlane_top = mouse_y - gameMT - myPlaneH / 2;
    // 控制飞机不能脱离当前的游戏界面
    if (last_myPlane_left <= 0) {
      last_myPlane_left = 0
    } else if (last_myPlane_left >= gameW - myPlaneW) {
      last_myPlane_left = gameW - myPlaneW
    }
    if (last_myPlane_top <= 0) {
      last_myPlane_top = 0
    } else if (last_myPlane_top >= gameH - myPlaneH) {
      last_myPlane_top = gameH - myPlaneH
    }
    myPlane.style.left = last_myPlane_left + 'px';
    myPlane.style.top = last_myPlane_top + 'px';
  }
  // 单位时间内创建子弹
  function shot() {
    if (timer) return;
    timer = setInterval(function () { 
      // 创建子弹
      createBullet()
    },100)
  }
  function createBullet() {
    let bullet = new Image(bulletW,bulletH) // 子弹的宽高
    bullet.src = "./image/bullet1.png"
    bullet.className = 'bullet'
    // 创建每一颗子弹都需要确定己方飞机的位置
    let myPlaneL = getStyle(myPlane,'left')
    let myPlaneT = getStyle(myPlane, 'top')
    /** 子弹的左边距 = 己方飞机的左边距 + 己方飞机宽度的一半 - 子弹宽度的一半
     *  子弹的上边距 = 己方飞机的上边距 - 子弹的高度
     */
    // 确定创建子弹的位置
    let bulletL = myPlaneL + myPlaneW / 2 - bulletW / 2;
    let bulletT = myPlaneT - bulletH;
    bullet.style.left = bulletL + 'px';
    bullet.style.top = bulletT + 'px';
    bulletsP.appendChild(bullet)
    bulletMove(bullet,"top")
  }
  // 实现子弹的运动轨迹
  function bulletMove(ele, attr) {
    var speed = -8;
    ele.timer = setInterval(function () {
      var moveVal = getStyle(ele, attr);
      // 子弹运动出游戏界面,清除子弹的定时器，删除子弹元素
      if (moveVal <= 0) {
        clearInterval(ele.timer);
        ele.parentNode.removeChild(ele)
      } else {
        ele.style[attr] = moveVal + speed + 'px';
      }
    },20)
  }
  // 创建敌机的数据对象
  let enemysObj = {
    enemy1: {
      width: 34,
      height: 24,
      score: 100,
      hp: 300
    },
    enemy2: {
      width: 46,
      height: 60,
      score: 500, // 得分
      hp: 800 // 血量
    },
    enemy3: {
      width: 110 ,
      height: 164,
      score: 1000,
      hp: 2000
    },
  }
  // 创建敌机定时器
  function appearEnemy() {
    if (EneTimer) return;
      EneTimer = setInterval(function () { 
      // 制造敌机
        createEnemy()
      // 删除死亡敌机
        delEnemy()
    },1000)
  }
  // 制造敌机的函数
  function createEnemy() {
    // 敌机出现概率的数据
    let percentData = [1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,3,3,3]
    // 敌机的类型
    let enemyType = percentData[Math.floor(Math.random() * percentData.length)]
    // 得到当前随机敌机的数据
    let enemyData = enemysObj["enemy" + enemyType]
    // 创建敌机所在的元素
    let enemy = new Image(enemyData.width, enemyData.height)
    enemy.src = `image/enemy${enemyType}.png`
    enemy.score = enemyData.score
    enemy.hp = enemyData.hp
    enemy.type = enemyType
    enemy.dead = false // 代表敌机存活
    // 确定当前敌机出现时的位置
    let enemyL = Math.floor(Math.random() * (gameW - enemyData.width + 1))
    let enemyT = -enemyData.height
    enemy.style.left = enemyL + 'px'
    enemy.style.top = enemyT + 'px'
    enemy.style.position = 'absolute'
    enemysP.appendChild(enemy)
    enemyMove(enemy,'top')
  }
  // 敌机的运动
  function enemyMove(ele, attr) {
    let speed = null;
    switch (ele.type) {
      case 1:
        speed = 1.5;
        break;
      case 2:
        speed = 1;
        break;
      case 3:
        speed = 0.5
        break;
    }
    ele.timer = setInterval(function () {
      let moveVal = getStyle(ele, attr)
      if (moveVal >= gameH) {
        clearInterval(ele.timer)
        ele.parentNode.removeChild(ele)
      } else {
        ele.style[attr] = moveVal + speed + 'px'
        // 每一驾敌机运动时,检测和每一颗子弹的碰撞
        crash(ele)
        // 检测碰撞
        gameOver()
      }      
    },20)
  }
  // 清除所有敌机和所有子弹的运动定时器
  function clearAll(children) {
    for (let i = 0; i < children.length; i++) {
      clearInterval(children[i].timer)
    }
  }
  // 重启暂停游戏之后的元素
  function reStartAll(children,type) {
    for (let i = 0; i < children.length; i++) {
      type == 1 ? bulletMove(children[i],"top") : enemyMove(children[i],"top")
    }
  }
  // 背景图跟随游戏进行时的变化
  function bgMove() {
    if(bgTimer) return
    bgTimer = setInterval(function () {
      bgPositionY += 0.5;
      if (bgPositionY >= gameH) {
        bgPositionY = 0
      }
      gameEnter.style.backgroundPositionY = bgPositionY + 'px'
    },20)
  }
  // 检测子弹和敌机的碰撞
  function crash(enemy) {
    /**
     * 子弹的左边距 + 子弹的宽度 >= 敌机的左边距
     * 子弹的左边距 <= 敌机的左边距 + 敌机的宽度
     * 子弹的上边距 <= 敌机的上边距 + 敌机的高度
     * 子弹的上边距 + 子弹的高度 >= 敌机的上边距
     */
    for (let i = 0; i < bulletsP.children.length; i++) {
      // 得到子弹的左、上边距
      let bulletL = getStyle(bulletsP.children[i], "left");
      let bulletT = getStyle(bulletsP.children[i], "top");
      // 得到敌机的左、上边距
      let enemyL = getStyle(enemy, "left");
      let enemyT = getStyle(enemy, "top");
      // 得到敌机的宽高
      let enemyW = getStyle(enemy, "width");
      let enemyH = getStyle(enemy, "height");
      var condition = bulletL + bulletW >= enemyL
        && bulletL <= enemyL + enemyW
        && bulletT <= enemyT + enemyH
        && bulletT + bulletH >= enemyT
      if (condition) {
        // 检测到子弹和敌机的碰撞，删除子弹
        // 1. 先清除碰撞子弹的定时器
        clearInterval(bulletsP.children[i].timer)
        // 2. 删除元素
        bulletsP.removeChild(bulletsP.children[i])
        // 3. 从集合中删除子弹
        let bullets = Array.from(bulletsP.children)
        bullets.splice(i, 1)
        // 4. 子弹和敌机发生碰撞后,敌机血量减少,血量为0时，删除敌机
        enemy.hp -= 50
        if (enemy.hp == 0) {
          // 删除敌机
          clearInterval(enemy.timer);
          // 删除敌机元素
          // enemysP.removeChild(enemy)
          enemy.src = `image/bz${enemy.type}.gif`
          // 标记死亡敌机
          enemy.dead = true
          score += enemy.score
          s.innerHTML = score
        }
      }
    }
  }
  // 在创建敌机时,延时删除掉集合和文档中的死亡敌机
  function delEnemy() {
    let enemys = Array.from(enemysP.children)
    enemys.forEach((item,index) => {
      if (item.dead) {
        (function (index) {
         // 从文档中删除死亡敌机元素
          enemysP.removeChild(enemys[index]);
         // 从集合中删除死亡敌机元素
          enemys.splice(index,1)
        })(index)
      }
    })
  }
  // 飞机碰撞，游戏结束
  function gameOver() {
    let enemys = Array.from(enemysP.children)
    for (let i = 0; i < enemys.length; i++) {
      if (!enemys[i].dead) { // 游戏机界面内存活的敌机
        // 检测碰撞
        // 1. 获取敌机的左、上边距
        let enemyL = getStyle(enemys[i], "left");
        let enemyT = getStyle(enemys[i], "top");
        // 2. 获取敌机的宽高
        let enemyW = getStyle(enemys[i], "width");
        let enemyH = getStyle(enemys[i], "height");
        // 3. 获取己方飞机的左、上边距
        let myPlaneL = getStyle(myPlane, "left");
        let myPlaneT = getStyle(myPlane, "top");
        /**
         * 己方飞机的左边距 + 己方飞机的宽度 >= 敌机的左边距    -> 左边的碰撞
         * 己方飞机的左边距 <= 敌机的左边距 + 敌机的宽度   -> 右边的碰撞
         * 己方飞机的上边距 <= 敌机的上边距 + 敌机的宽度   -> 下边的碰撞
         * 己方飞机的上边距 + 己方飞机的高度 >= 敌机的上边距   -> 上边的碰撞
         */
        let condition = myPlaneL + myPlaneW >= enemyL && myPlaneL <= enemyL + enemyW && myPlaneT <= enemyT + enemyW && myPlaneT + myPlaneH >= enemyT;
        if (condition) {
          // 己方飞机和敌机的碰撞
          // alert('GameOver!!')
          // 清除定时器
          clearInterval(EneTimer)
          clearInterval(timer)
          clearInterval(bgTimer)
          timer = null
          EneTimer = null
          bgTimer = null
          // 删除子弹和敌机的元素
          remove(bulletsP.children)
          remove(enemysP.children)
          // 清除己方飞机的移动事件
          document.onmousemove = null
          // 提示得分
          alert(`Game Over: ${score} 分`)
          // 回到游戏开始界面
          gameEnter.style.display = 'none'
          gameStart.style.display = 'block'
          myPlane.style.left = '127px'
          myPlane.style.top = gameH - myPlaneH + 'px'
          myPlane.style.bottom = "0"

        }
      }
    }
  }
  // 删除元素
  function remove(children) {
    let childrenArr = Array.from(children)
    childrenArr.forEach((item, index) => {
      clearInterval(item.timer)
      item.parentNode.removeChild(item)
    })
  }
}
