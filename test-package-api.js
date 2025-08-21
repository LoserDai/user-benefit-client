// 权益包接口测试脚本
// 在浏览器控制台中运行此脚本来测试接口

// 测试基础查询
async function testBasicQuery() {
  console.log('=== 测试基础查询 ===')

  const params = {
    pageNum: 1,
    pageSize: 10,
    status: 'ACTIVE',
  }

  try {
    const response = await fetch('/api/package/queryPackage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })

    const result = await response.json()
    console.log('基础查询结果:', result)

    if (result.code === 200) {
      console.log('✅ 接口调用成功')
      console.log('数据条数:', result.data?.data?.length || 0)
      console.log('总条数:', result.data?.total || 0)
    } else {
      console.log('❌ 接口返回错误:', result.message)
    }
  } catch (error) {
    console.error('❌ 接口调用失败:', error)
  }
}

// 测试分页查询
async function testPagination() {
  console.log('=== 测试分页查询 ===')

  const params = {
    pageNum: 2,
    pageSize: 5,
    status: 'ACTIVE',
  }

  try {
    const response = await fetch('/api/package/queryPackage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })

    const result = await response.json()
    console.log('分页查询结果:', result)

    if (result.code === 200) {
      console.log('✅ 分页查询成功')
      console.log('当前页数据:', result.data?.data || [])
    } else {
      console.log('❌ 分页查询失败:', result.message)
    }
  } catch (error) {
    console.error('❌ 分页查询失败:', error)
  }
}

// 测试搜索功能
async function testSearch() {
  console.log('=== 测试搜索功能 ===')

  const params = {
    pageNum: 1,
    pageSize: 10,
    status: 'ACTIVE',
    remark: '权益', // 搜索关键词
  }

  try {
    const response = await fetch('/api/package/queryPackage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })

    const result = await response.json()
    console.log('搜索查询结果:', result)

    if (result.code === 200) {
      console.log('✅ 搜索查询成功')
      console.log('搜索结果:', result.data?.data || [])
    } else {
      console.log('❌ 搜索查询失败:', result.message)
    }
  } catch (error) {
    console.error('❌ 搜索查询失败:', error)
  }
}

// 测试排序功能
async function testSorting() {
  console.log('=== 测试排序功能 ===')

  const params = {
    pageNum: 1,
    pageSize: 10,
    status: 'ACTIVE',
    sortField: 'price',
    sortOrder: 'asc',
  }

  try {
    const response = await fetch('/api/package/queryPackage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })

    const result = await response.json()
    console.log('排序查询结果:', result)

    if (result.code === 200) {
      console.log('✅ 排序查询成功')
      console.log('排序后数据:', result.data?.data || [])
    } else {
      console.log('❌ 排序查询失败:', result.message)
    }
  } catch (error) {
    console.error('❌ 排序查询失败:', error)
  }
}

// 运行所有测试
async function runAllTests() {
  console.log('🚀 开始运行权益包接口测试...')

  await testBasicQuery()
  await new Promise((resolve) => setTimeout(resolve, 1000)) // 等待1秒

  await testPagination()
  await new Promise((resolve) => setTimeout(resolve, 1000)) // 等待1秒

  await testSearch()
  await new Promise((resolve) => setTimeout(resolve, 1000)) // 等待1秒

  await testSorting()

  console.log('🎉 所有测试完成！')
}

// 在浏览器控制台中运行以下命令来测试：
// runAllTests()
// 或者单独测试：
// testBasicQuery()
// testPagination()
// testSearch()
// testSorting()

console.log('权益包接口测试脚本已加载！')
console.log('运行 runAllTests() 来执行所有测试')
console.log('或者运行单个测试函数，如 testBasicQuery()')
