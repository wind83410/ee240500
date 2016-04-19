# Midterm Project Report

### Automatic exploring prototype

###目錄
*    [結果](#result)
*    [討論](#discussion)

<h3 id="result">結果</h3>
如圖所示，藍色的長方形是虛擬車，紅色細長的長方形在兩側代表輪子，黃色點所標的位置為車子的超音波距離感測器；灰色線條代表牆面，構成一張簡單的地圖。三軸加速器可使車子移動。按下鍵盤的 S 鍵後感測器的位置則會從最左邊旋轉到最右邊，每 10 度為一個單位，擷取 18 個點作為地圖探索資訊，
此為模擬超音波感測器的感測行為：先轉一個角度之後再發射超音波感測，該 18 點會根據位置顯示在右邊。
<h3 id="discussion">討論</h3>