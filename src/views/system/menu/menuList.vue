<template>
    <el-main>
    <!-- 新增按钮 -->
    <el-button type="success" icon="el-icon-plus" @click="openAddWindow">新增</el-button>
    <!-- 数据表格 -->
    <el-table
        style="margin-top: 10px"
        :height="tableHeight"
        :data="menuList"
        row-key="id"
        default-expand-all
        :tree-props="{ children: 'children' }"
        :border="true"
        stripe
        >
        <el-table-column align="center" prop="label" label="菜单名称"></el-table-column>
        <el-table-column prop="type" label="菜单类型" align="center">
            <template slot-scope="scope">
                <el-tag v-if="scope.row.type == '0'" size="normal">目录</el-tag>
                <el-tag type="success" v-else-if="scope.row.type == '1'" size="normal">菜单</el-tag>
                <el-tag type="warning" v-else-if="scope.row.type == '2'" size="normal">按钮</el-tag>
            </template>
        </el-table-column>
        <el-table-column prop="icon" label="图标" align="center">
            <template slot-scope="scope">
                <i :class="scope.row.icon" v-if="scope.row.icon.includes('el-icon')"> </i>
                <svg-icon v-else :icon-class="scope.row.icon"></svg-icon>
            </template>
        </el-table-column>
        <el-table-column align="center" prop="name" label="路由名称"></el-table-column>
        <el-table-column align="center" prop="path" label="路由地址"></el-table-column>
        <el-table-column align="center" prop="url" label="组件路径"></el-table-column>
        <el-table-column align="center" label="操作">
            <template slot-scope="scope">
                <el-button
                type="primary"
                icon="el-icon-edit"
                size="small"
                @click="editMenu(scope.row)"
                >编辑
                </el-button>
                <el-button
                type="danger"
                size="small"
                icon="el-icon-delete"
                @click="deleteMenu(scope.row)"
                >删除
                </el-button>
            </template>
        </el-table-column>
    </el-table>
    <!-- 新增或编辑弹框 -->
    <system-dialog
    :title="menuDialog.title"
    :width="menuDialog.width"
    :height="menuDialog.height"
    :visible="menuDialog.visible"
    @onClose="onClose"
    @onConfirm="onConfirm"
    >
        <div slot="content">
        <el-form
        :model="menu"
        ref="menuForm"
        :rules="rules"
        label-width="80px"
        :inline="true"
        size="small"
        >
            <el-row>
                <el-col :span="24">
                <el-form-item prop="type" label="菜单类型">
                        <el-radio-group v-model="menu.type">
                            <el-radio :label="0">目录</el-radio>
                            <el-radio :label="1">菜单</el-radio>
                            <el-radio :label="2">按钮</el-radio>
                        </el-radio-group>
                </el-form-item>
                </el-col>
            </el-row>
                <el-form-item prop="parentName" size="small" label="所属菜单">
                    <el-input
                        @click.native="selectParentMenu()"
                        v-model="menu.parentName"
                        :readonly="true"
                    ></el-input>
                </el-form-item>
                <el-form-item prop="label" size="small" label="菜单名称">
                    <el-input v-model="menu.label"></el-input>
                </el-form-item>
                <el-form-item
                prop="name"
                v-if="menu.type == 1"
                size="small"
                label="路由名称"
                >
                    <el-input v-model="menu.name"></el-input>
                </el-form-item>
                <el-form-item
                prop="path"
                v-if="menu.type != 2"
                size="small"
                label="路由地址"
                >
                    <el-input v-model="menu.path"></el-input>
                </el-form-item>
                <el-form-item
                prop="url"
                v-if="menu.type == 1"
                size="small"
                label="组件路径"
                >
                    <el-input v-model="menu.url"></el-input>
                </el-form-item>
                <el-form-item prop="code" size="small" label="权限字段">
                    <el-input v-model="menu.code"></el-input>
                </el-form-item>
                <el-form-item size="small" label="菜单图标">
                    <my-icon @selecticon="setIcon" ref="child"></my-icon>
                </el-form-item>
                <el-form-item size="small" label="菜单序号">
                    <el-input v-model="menu.orderNum"></el-input>
                </el-form-item>
            </el-form>
        </div>
    </system-dialog>
    <!-- 选择所属菜单弹框 -->
    <system-dialog
    :title="parentDialog.title"
    :width="parentDialog.width"
    :height="parentDialog.height"
    :visible="parentDialog.visible"
    @onClose="onParentClose"
    @onConfirm="onParentConfirm"
    >
        <div slot="content">
            <el-tree
            style="font-size: 14px"
            ref="parentTree"
            :data="parentMenuList"
            node-key="id"
            :props="defaultProps"
            empty-text="暂无数据"
            :show-checkbox="false"
            default-expand-all
            :highlight-current="true"
            :expand-on-click-node="false"
            @node-click="handleNodeClick"
            >
                <div class="customer-tree-node" slot-scope="{ node, data }">
                    <!-- 长度为0说明没有下级 -->
                    <span v-if="data.children.length == 0">
                        <i class="el-icon-document" style="color: #8c8c8c; font-size: 18px"/>
                    </span>
                    <span v-else @click.stop="openBtn(data)">
                        <svg-icon v-if="data.open" icon-class="add-s"/>
                        <svg-icon v-else icon-class="sub-s"/>
                    </span>
                    <span style="margin-left: 3px">{{ node.label }}</span>
                </div>
            </el-tree>
        </div>
    </system-dialog>
</el-main>
</template>


<script>
//导入menu.js脚本代码
import menuApi from '@/api/menu';
//导入对话框组件
import SystemDialog from '@/components/system/SystemDialog.vue'

//导入自定义选择图标组件
import MyIcon from '@/components/system/MyIcon.vue'
export default {
    name:"menuList",
    data(){
        return {
            menuList:[],//菜单列表
            tableHeight:0,//列表高度
            menuDialog:{
                title:'',
                visible:false,
                width:630,
                height:270
            },
            //菜单属性
            menu: {
                id: "",
                type: "",
                parentId: "",
                parentName: "",
                label: "",
                icon: "",
                name: "",
                path: "",
                url: "",
                code: "",
                orderNum: "",
            },
            //表单校验规则
            rules: {
                type: [{ required: true, trigger: "change", message: "请选择菜单类型" }],
                parentName: [{ required: true, trigger: "change", message: "请选择所属菜单"}],
                label: [{ required: true, trigger: "blur", message: "请输入菜单名称" }],
                name: [{ required: true, trigger: "blur", message: "请输入路由名称" }],
                path: [{ required: true, trigger: "blur", message: "请输入路由路径" }],
                url: [{ required: true, trigger: "blur", message: "请输入组件路径" }],
                code: [{ required: true, trigger: "blur", message: "请输入权限字段" }],
            },
            parentDialog:{
                title: '选择所属菜单',
                width: 280,
                height: 450,
                visible: false
            },
            //树属性定义
            defaultProps: {
                children: 'children',
                label: 'label'
            },
            parentMenuList: [], //所属菜单列表
        }
    },
    //注册组件
    components:{
        SystemDialog,
        MyIcon,
    },
    //初始化时调用
    created(){
        //调用查询菜单列表的方法
        this.search();
    },
    mounted(){
        //固定当向下滑动页面时，页面头部不发生变化
        this.$nextTick(() =>{
            this.tableHeight = window.innerHeight -180;
        })
    },
    methods:{
        /**
         * 查询菜单列表
         */
        async search(){
            let res = await menuApi.getMenuList();
            //判断是否成功
            if(res.success){
                this.menuList = res.data;
            }
        },
        /**
        * 所属菜单节点点击事件
        */
        handleNodeClick(data) {
            //所属父级菜单ID
            this.menu.parentId = data.id;
            //所属父级菜单名称
            this.menu.parentName = data.label;
            console.log(this.menu.parentName)
        },
        /**
         * 打开新增窗口
         */
        openAddWindow(){
            this.$resetForm('menuForm', this.menu) //清空表单数据
            this.menuDialog.title = '新增菜单' //设置窗口标题
            this.menuDialog.visible = true //显示窗口
            this.$nextTick(() => {
            this.$refs["child"].userChooseIcon = "";//清空菜单图标
            })
        },
        /**
         * 选择所属菜单
         */
        async selectParentMenu(){
            //显示窗口
            this.parentDialog.visible = true;
            //发送查询请求
            let res = await menuApi.getParentMenuList();
            //判断是否成功
            if (res.success) {
                //赋值
                this.parentMenuList = res.data;
            }
        },
        /**
        * 切换图标
        * @param data
        */
        openBtn(data) {
            data.open = !data.open
            this.$refs.parentTree.store.nodesMap[data.id].expanded = !data.open
        },
        /**
         * 关闭取消按钮的点击事件
         */
        onClose(){
            this.menuDialog.visible = false
        },
        /**
         * 确认点击事件
         */
        onConfirm(){
            //表单验证
            this.$refs.menuForm.validate(async (valid)=>{
                if(valid){
                    let res = null;
                    //判断当前操作是新增操作还是修改操作
                    if(this.menu.id === ''){
                        //发送添加请求
                        res = await menuApi.addMenu(this.menu);
                    }else{
                        //发送修改请求
                        res = await menuApi.updateMenu(this.menu);
                    }
                    //判断是否成功
                    if(res.success){
                        //提示
                        this.$message.success(res.message);
                        //刷新数据表格
                        this.search();
                        //关闭窗口
                        this.menuDialog.visible = false
                    }else{
                        this.$message.error(res.message);
                    }
                    
                }
            })
            
        },
        /**
        * 选择所属菜单取消事件
        */
        onParentClose() {
            this.parentDialog.visible = false //关闭窗口
        },
        /**
        * 选择所属菜单确认事件
        */
        onParentConfirm() {
            this.parentDialog.visible = false //关闭窗口
        },
        /**
        * 给icon绑定的点击事件
        * @param icon
        */
        setIcon(icon) {
            this.menu.icon = icon;
        },
        /**
         * 打开编辑菜单窗口的点击事件
         * @param row 
         */
        editMenu(row){
            //数据回显
            this.$objCopy(row,this.menu);
            this.menuDialog.title = '编辑菜单' //设置窗口标题
            this.menuDialog.visible = true //显示窗口
            this.$nextTick(() => {
                this.$refs["child"].userChooseIcon = row.icon;//回显菜单图标
            })
        },
        /**
         * 删除菜单按钮点击事件
         * @param row 
         */
        async deleteMenu(row){
            //判断是否存在子菜单
            let result = await menuApi.checkPermission({ id: row.id });
            //判断是否可以删除
            if (!result.success) {
                //提示不能删除
                this.$message.warning(result.message);
            } else {
                //确认是否删除
                let confirm =await this.$myconfirm("确定要删除该数据吗?");
                if (confirm) {
                    //发送删除请求
                    let res = await menuApi.deleteById({ id: row.id });
                    //判断是否成功
                    if (res.success) {
                        //成功提示
                        this.$message.success(res.message);
                        //刷新
                        this.search();
                    } else {
                        //失败提示
                        this.$message.error(res.message);
                    }
                }
            }
        }
        
    }
};
</script>

<style lang="scss" scoped>
::v-deep .el-tree {
        .el-tree-node {
            position: relative;
            padding-left: 10px;
        }
        .el-tree-node__children {
            padding-left: 20px;
        }
        .el-tree-node :last-child:before {
            height: 40px;
        }
        .el-tree > .el-tree-node:before {
            border-left: none;
        }
        .el-tree > .el-tree-node:after {
            border-top: none;
        }
        .el-tree-node:before,
        .el-tree-node:after {
            content: "";
            left: -4px;
            position: absolute;
            right: auto;
            border-width: 1px;
        }
        .tree :first-child .el-tree-node:before {
            border-left: none;
        }
        .el-tree-node:before {
            border-left: 1px dotted #d9d9d9;
            bottom: 0px;
            height: 100%;
            top: -25px;
            width: 1px;
        }
        .el-tree-node:after {
            border-top: 1px dotted #d9d9d9;
            height: 20px;
            top: 14px;
            width: 24px;
        }
        .el-tree-node__expand-icon.is-leaf {        
            width: 8px;
        }
        .el-tree-node__content > .el-tree-node__expand-icon {
            display: none;
        }
        .el-tree-node__content {
            line-height: 30px;
            height: 30px;
            padding-left: 10px !important;
        }
    }
    ::v-deep .el-tree > div {
        &::before {
            display: none;
        }
        &::after {
        display: none;
        }
    }
</style>