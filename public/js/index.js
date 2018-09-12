layui.use(["element", "laypage"], () => {
  let element = layui.element
  let laypage = layui.laypage
  const $ = layui.$
  
  element.tabDelete('demo', 'xxx')
 

  laypage.render({
    elem: "laypage",
    count: $("#laypage").data("maxnum"),
    limit: $("#laypage").data("maxbreak"),
    groups: 3,
    curr: location.pathname.replace("/page/", ""),
    jump(obj, f){
      $("#laypage a").each((i, v) => {
        const residue = Math.ceil(obj.count / obj.limit);
        v.href = ($(v).data("page") === 0 || $(v).data("page") === (residue + 1)) ? 'javascript:;' : `/page/${$(v).data("page")}`;
      })
    }
  })
})
