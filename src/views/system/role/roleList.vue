<template>
    <el-main>
    <!-- 查询条件 -->
    <el-form
    :model="searchModel"
    ref="searchForm"
    label-width="80px"
    :inline="true"
    size="small"
    >
        <el-form-item>
            <el-input v-model="searchModel.roleName" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item>
            <el-button type="primary" icon="el-icon-search" @click="search(pageNo,pageSize)">查询</el-button>
            <el-button icon="el-icon-refresh-right" @click="resetValue()">重置</el-button>
            <el-button type="success" icon="el-icon-plus" @click="openAddWindow()">新增</el-button>
        </el-form-item>
    </el-form>
    <!-- 数据表格 -->
    <el-table
    :data="roleList"
    :height="tableHeight"
    border
    stripe
    style="width: 100%; margin-bottom: 10px"
    >
        <el-table-column prop="id" label="角色编号" width="100" align="center"></el-table-column>
        <el-table-column prop="roleCode" label="角色编码" align="center"></el-table-column>
        <el-table-column prop="roleName" label="角色名称" align="center"></el-table-column>
        <el-table-column prop="remark" label="角色备注" align="center"></el-table-column>
        <el-table-column label="操作" align="center" width="290">
            <template slot-scope="scope">
                <el-button
                icon="el-icon-edit"
                type="primary"
                size="small"
                @click="handleEdit(scope.row)"
                >编辑
                </el-button>
                <el-button
                icon="el-icon-delete"
                type="danger"
                size="small"
                @click="handleDelete(scope.row)"
                >删除
                </el-button>
                <el-button
                icon="el-icon-setting"
                type="primary"
                size="small"
                @click="assignRole(scope.row)"
                >分配权限
                </el-button>
            </template>
        </el-table-column>
    </el-table>
    <!-- 分页工具栏 -->
    <el-pagination
    background
    @size-change="handleSizeChange"
    @current-change="handleCurrentChange"
    :current-page="pageNo"
    :page-sizes="[5, 8, 10, 20, 50]"
    :page-size="10"
    layout="total, sizes, prev, pager, next, jumper"
    :total="total"
    >
    </el-pagination>
    <!-- 添加和修改角色窗口 -->
    <system-dialog
    :title="roleDialog.title"
    :visible="roleDialog.visible"
    :width="roleDialog.width"
    :height="roleDialog.height"
    @onClose="onClose"
    @onConfirm="onConfirm"
    >
        <div slot="content">
            <el-form
            :model="role"
            ref="roleForm"
            :rules="rules"
            label-width="80px"
            :inline="false"
            size="small"
            >
                <el-form-item label="角色编码" prop="roleCode">
                    <el-input v-model="role.roleCode"></el-input>
                </el-form-item>
                <el-form-item label="角色名称" prop="roleName">
                    <el-input v-model="role.roleName"></el-input>
                </el-form-item>
                <el-form-item label="角色描述">
                    <el-input type="textarea" v-model="role.remark" :rows="5"></el-input>
                </el-form-item>
            </el-form>
        </div>
    </system-dialog>
    </el-main>
</template>

<script>
//导入role.js中的方法
import {getRoles,addRole,updateRole,deleteRole,checkRole} from '@/api/role'
//导入对话框组件
import SystemDialog from '@/components/system/SystemDialog.vue';
export default {
    name: 'roleList',
    //注册组件
    components:{
        SystemDialog
    },
    data(){
        return {
            //查询条件
            searchModel: {
                roleName: '',//角色名称
                pageNo:1,//当前页码
                pageSize:10,//每页显示数量
                userId:this.$store.getters.userId//当前用户的用户ID
            },
            roleList: [], //数据列表
            tableHeight: 0, //表格高度
            pageNo: 1, //当前页码
            pageSize: 10, //每页显示数量
            total: 0, //总数量
            //表单验证规则
            rules: {
                roleCode: [{ required: true, trigger: 'blur', message: '请输入角色编码' }],
                roleName: [{ required: true, trigger: 'blur', message: '请输入角色名称' }]
            },
            //添加和修改角色窗口属性
            roleDialog: {
                title: '',//窗口标题
                visible: false,//是否显示
                height: 230,
                width: 500
            },
            //角色对象
            role: {
                id:"",
                roleCode:"",//对象编码
                roleName:"",//角色名称
                remark:"",//角色描述
                createUser:''//创建该角色的用户id
            }
        }
    },
    methods: {
        /**
        * 查询
        */
        async search(pageNo=1,pageSize=10) {
            this.searchModel.pageNo = pageNo
            this.searchModel.pageSize = pageSize
            //发送查询请求
            let res = await getRoles(this.searchModel);
            if(res.success){
                this.roleList = res.data.records;
                this.total = res.data.total;
            }
        },
        /**
        * 重置查询条件
        */
        resetValue() {
            //清空数据
            this.searchModel.roleName = '';
            //重新查询
            this.search();
        },
        /**
        * 当每页数量发生变化时触发该事件
        */
        handleSizeChange(size) {
            //修改每页显示的数量
            this.pageSize = size;
            //调用查询方法
            this.search(this.pageNo,size);
        },
        /**
        * 当页码发生变化时触发该事件
        */
        handleCurrentChange(page) {
            this.page = page;
            //调用查询方法
            this.search(page,this.pageSize);
        },
        /**
         * 打开添加窗口 
         */
        openAddWindow(){
            //清空表单数据
            this.$resetForm("roleForm",this.role);
            //设置窗口标题
            this.roleDialog.title = "新增角色"
            //显示窗口
            this.roleDialog.visible = true
        },
        //窗口关闭取消点击事件
        onClose(){
            this.roleDialog.visible = false
        },
        //窗口确定点击事件
        onConfirm(){
            //表单验证
            this.$refs.roleForm.validate(async (valid)=>{
                this.role.createUser = this.$store.getters.userId
                let res = null;
                if(valid){
                    //验证通过
                    if(valid){
                        //判断当前时新增还是修改
                        if(this.role.id === ""){
                            //发送新增请求
                            res = await addRole(this.role);
                        }else{
                            //发送修改请求
                            res = await updateRole(this.role);
                        }
                    }
                    //判断是否成功
                    if(res.success){
                        //提示成功
                        this.$message.success(res.message);
                        //刷新数据
                        this.search();
                        //关闭窗口
                        this.roleDialog.visible = false
                    }else{
                        //提示失败
                        this.$message.error(res.message);
                    }
                }
            });
        },
        /**
        * 打开编辑窗口
        */
        handleEdit(row) {
            //数据回显
            this.$objCopy(row,this.role);
            //设置窗口标题
            this.roleDialog.title = "编辑角色"
            //显示编辑窗口
            this.roleDialog.visible = true
        },
        /**
        * 删除
        */
        async handleDelete(row) {
            //查询该角色是否被使用
            let result = await checkRole({id:row.id});
            //判断是否可以删除
            if(!result.success){
                //提示不能删除
                this.$message.warning(result.message);
            }else{
                //确认是否删除
                let confirm = await this.$myconfirm("确定删除该数据码？");
                if(confirm){
                    //发送删除请求
                    let res = await deleteRole({id:row.id});
                    //判断是否成功
                    if(res.success){
                        //成功提示
                        this.$message.success(res.message)
                        //刷新数据
                        this.search(this.pageNo,this.pageSize);
                    }else{
                        //提示失败
                        this.$message.error(res.message)
                    }
                }
            }
        },
    },
    //初始化时调用
    created(){
        this.search();
    },
    //挂载后调用
    mounted() {
        this.$nextTick(() => {
            this.tableHeight = window.innerHeight - 220
        })
    }
};
</script>

<style>
</style>