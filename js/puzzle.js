/*
 *  拼图的单元格
 *
 *  属性
 *  position : 单元格的位置，表示单元格实际所在的位置
 *  data : 单元格对应的数字，表示单元格应该在的位置，不随position的改变变化
 *  row : 每行单元格的个数，对应父组件的level
 *  number : 单元格的总数，对应父组件的number
 *  isStart : 表示是否已经开始游戏
 *  isComplete : 表示游戏是否已经完成
 *  x : 横坐标，计算属性，由position计算所得
 *  y : 纵坐标，计算属性，由position计算所得
 *  imgx : 背景图片的位置，有data计算所得
 *  imgy : 背景图片的位置，有data计算所得
 *  cellWidth : 单元格宽度
 *  styleObject : 行内样式
 *
 *  方法
 *  move : 移动单元格，触发父组件的move事件
 */
var PuzzleCell = Vue.extend({
	template : '#p-cell',
	props : ['position','data','isStart','isComplete','row','number'],
	
	computed : {
		x : function(){
			return this.position%this.row;
		},
		y : function(){
			return (this.position-this.x)/this.row;
		},
		imgx : function(){
			return this.data%this.row;
		},
		imgy : function(){
			return (this.data-this.imgx)/this.row;
		}, 
		cellWidth : function(){
			return 600/this.row;
		},

		styleObject : function(){
			//单元格的绝对定位和背景图片的位置，其中，键值background-position需要加双引号，或者使用驼峰法
			//判断最后一个单元格是否显示
			if(this.isStart && (!this.isComplete) && this.data == this.number-1){
				return {
					top : this.y*this.cellWidth + "px",
					left : this.x*this.cellWidth + "px",
					backgroundPosition : "-600px -600px",
					zIndex : -1,
					height : this.cellWidth + "px",
					width : this.cellWidth + "px",
				}
			}

			return {
				top : this.y*this.cellWidth + "px",
				left : this.x*this.cellWidth + "px",
				backgroundPosition : -this.imgx*this.cellWidth + "px "+ (-this.imgy*this.cellWidth)+"px",
				height : this.cellWidth + "px",
				width : this.cellWidth + "px",
			}
		}
	},
	methods : {
		move : function(){
			if(this.isStart && (!this.isComplete))
			this.$dispatch('move',this);
		}
	}
});

Vue.component('cell' , PuzzleCell);

/**
 *  游戏的属性和方法
 * 	
 *  属性 
 *  dataArr : 单元格的position和data属性的对应关系，数组的index对应position，数组元素对应data，用来判断游戏是否完成
 *  level : 游戏等级，用数字表示
 *  number : 单元格个数，level的平方
 *  isStart : 表示是否已经开始游戏
 *  isComplete : 表示游戏是否已经完成
 *  
 *  方法 
 *  start：开始游戏
 *  shuffle : 打乱数组顺序，即改变每个单元格的位置
 *  moveData : 移动单元格之后，交换数组对应位置的数据
 *  check : 检查打乱的数组顺序是否有解
 *  complete : 检查游戏是否完成  
 *  changeLevel : 改变游戏难度
 *  
 *  事件
 *  move : 移动单元格，由子组件触发
 * 
**/
var vm = new Vue({
	el : '#puzzle',
	data : {
		dataArr : [0,1,2,3,4,5,6,7,8],
		number : 9,
		level : 3,
		isStart : false,
		isComplete : false,
		showModal : false
	},
	
	methods : {
		reset : function(){
			this.number = Math.pow(this.level,2);
			this.dataArr.length = this.number;
			for(var i = 0; i< this.number; i++){
				this.dataArr[i] = i;
			}
			this.isStart = false;
			this.isComplete = false;
			this.showModal = false;
		},
		start : function(){
			if(this.isStart){
				if(confirm("确定重新开始游戏吗")){
					this.reset();
				}
				else{
					return ;
				}
			}
			this.isStart = true;
			this.isComplete = false;
			this.shuffle();
			for(var i = 0 , len = this.$children.length ; i < len ; i++){
				this.$children[this.dataArr[i]].position = i;
			}

		},
		shuffle : function(){
			var arr = this.dataArr;
			for(i=0,len=arr.length-1;i<len;i++){
				var idx = Math.floor(Math.random()*(len-i));
				var tmp = arr[idx];
				arr[idx] = arr[len-1-i];
				arr[len-1-i] = tmp;
			}
			
			this.check();
		},
		//move：要移动的单元格的位置
		//blank : 空白单元格的位置
		moveData : function(move,blank){
			var arr = this.dataArr,
				tmp = arr[move];
			arr[move] = arr[blank];
			arr[blank] = tmp;

		},
		check : function(){
			var arr = this.dataArr,
				i,
				j,
				len = arr.length,
				count=0;
			for(i = 0;i<len;i++){
				for(j=i+1;j<len;j++){
					if(arr[i]>arr[j]){
						count++;
					}
				}
			}
			
			if(count%2 != 0 || count == 0){
				var tmp = arr[0];
				arr[0] = arr[1];
				arr[1] = tmp;
			}
		},
		complete : function(){
			var arr = this.dataArr;
			for (var i = 0 , len = arr.length; i < len; i++) {
				if(arr[i] != i){
					break ; 
				}
			};
			if(i == len){
				this.isComplete = true;
				this.showModal = true;
				// this.isStart = false;
			}
				
		},
		changeLevel : function(level){
			if(this.isStart) return;
			this.level = level;
			this.number = level*level;
			this.dataArr.length = this.number;
			for(var i = 0; i< this.number; i++){
				this.dataArr[i] = i;
			}
		}
	},
	events : {
		move : function(vmcell){
			
			var blankcell = this.$children[this.number-1];
			if(Math.pow(blankcell.x-vmcell.x,2)+Math.pow(blankcell.y-vmcell.y,2) == 1){
				this.moveData(vmcell.position,blankcell.position);

				var tmp = vmcell.position;
				vmcell.position = blankcell.position;
				blankcell.position = tmp;

				this.complete();
			}
		}
	}
});