// 获取表单的数据;

/***input 不注明的话默认是第一个,需要进行遍历,过滤的操作;
 * 
 *  */
$(function () {
    $('button').click(function () {

        var val1 = $('input:first').val(); //或者使用eq()来进行索引
        // var val3=$('input').eq(0).val();
        // location.href="../task10/task10.html";//不同级文件的访问 
        var val2 = $('input:last').val();
        console.log(val1, val2);
        // 进行逻辑判断,防止输入空值
        if (!val1) {
            alert("请输入用户名");
            $('input:first').focus();
            return;

        };
        if (!val2) {
            alert("密码不能为空");
            $('input:last').focus();
            return;

        };

        $.ajax({
            url: '/carrots-admin-ajax/a/login',
            type: "post",
            datatype: "json",
            data: {
                name: val1,
                pwd: val2
            },
            success: function () {
                console.log('hh');
                alert("success!");
                window.location.assign('http://dev.admin.carrots.ptteng.com/');


            },
            error: function () {
                alert('数据请求失败');
            }
        })

    });
});