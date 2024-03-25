# 如何从 0 到 1 实现一个 php 框架

本人开发的框架在 2021 年年初开发完成，后面没有再做过任何维护和修改。是仅供大家参考交流的学习项目，请勿使用在生产环境，也勿用作商业用途。

框架地址：
[https://github.com/yijiebaiyi/fast_framework](https://github.com/yijiebaiyi/fast_framework)

## 整体思路

开发一款 web 框架，首先要考虑这个框架的整体运行架构，然后具体到那些功能的扩展。那么我开发框架的时候想的是，精简为主，实用为主。主要功能需要包括入口文件、路由解析、异常处理、日志记录、ORM、缓存、类依赖注入。

## 入口文件

入口文件需要定义全局变量，主要是核心框架文件的所在路径，然后，通过 include_once 引入框架核心类文件，初始化框架进行初始化操作。

```PHP
<?php

define("FAST_PATH", $_SERVER["DOCUMENT_ROOT"] . DIRECTORY_SEPARATOR . "fast");

// 初始化
include_once FAST_PATH . DIRECTORY_SEPARATOR . "App.php";
(new \fast\App())->init();
```

## 应用核心类

应用核心类主要是用来注册类的自动加载、加载环境变量文件、注册错误异常以及注册路由。下面是应用初始化 init 方法。

```PHP
    public function init()
    {
        if (false === $this->isInit) {
            define("DOCUMENT_ROOT", $_SERVER["DOCUMENT_ROOT"]);
            define("ROOT_PATH", $_SERVER["DOCUMENT_ROOT"]);
            define("RUNTIME_PATH", $_SERVER["DOCUMENT_ROOT"] . DIRECTORY_SEPARATOR . "runtime");
            define("APP_PATH", $_SERVER["DOCUMENT_ROOT"]);

            // 注册自动加载
            require_once FAST_PATH . DIRECTORY_SEPARATOR . "Autoload.php";
            (new Autoload())->init();

            // 注册配置
            (new Config())->init();

            // 加载env
            (new Env())->init();

            // 注册错误和异常
            (new Exception())->init();
            (new Error())->init();
            (new Shutdown())->init();

            // 检验运行环境
            $this->validateEnv();

            // 注册路由
            (new Route())->init();

            $this->isInit = true;
        }
    }
```

上面初始化的方法中，我们需要先判断框架是否已经初始化，如果已经初始化则不需要再进行操作了。init 方法中所涉及到的类都在框架核心文件根目录下面，需要注意的是，一定要先注册自动加载，不然使用 new 关键字生成对象就会报错。下面是自动加载类的自动加载方法。

```PHP
    public function init()
    {
        if (false === $this->isInit) {
            spl_autoload_register(array($this, 'autoload'));

            $this->isInit = true;
        }
    }

    /**
     * @var array 类加载次
     */
    private static array $loadedClassNum = [];

    /**
     * 自动加载
     * @param $name
     * @throws Exception
     */
    public static function autoload($name): void
    {
        if (trim($name) == '') {
            throw new Exception("No class for loading");
        }

        $file = self::formatClassName($name);

        if (isset(self::$loadedClassNum[$file])) {
            self::$loadedClassNum[$file]++;
            return;
        }
        if (!$file || !is_file($file)) {
            return;
        }
        // 导入文件
        include $file;

        if (empty(self::$loadedClassNum[$file])) {
            self::$loadedClassNum[$file] = 1;
        }
    }

    /**
     * 返回全路径
     * @param $className
     * @return string
     */
    private static function formatClassName($className): string
    {
        return $_SERVER['DOCUMENT_ROOT'] . DIRECTORY_SEPARATOR . $className . '.php';
    }

```

使用 PHP 提供的**spl_autoload_register**自动加载器函数，注册 autoload 方法实现自动加载，可以看到我们自动加载的类必须都在项目根目录下才可以实现。这是一个简单的约定。

## 加载配置

我们知道 php 使用 include 导入文件是可以获取到文件的返回值的（如果有的话），所以使用 php 文件返回一个数组来实现项目的配置文件，框架里面支持默认的**config.php**文件，以及额外用户可以自定义的配置：extra.php。这个也是我们约定好的。

配置文件示例代码 config.php：

```PHP
<?php

return [
    "Cache" => [
        "default" => "redis",
        "redis" => [
            "master" => [
                "pconnect" => false,
                "host" => "localhost",
                "port" => 6379,
                "timeout" => 0,
            ],
        ],
    ],
    "Log" => [
        "default" => "file",
        "file" => [
            "path" => RUNTIME_PATH
        ],
    ]
];
```

引入配置文件的关键代码：

```PHP
    /**
     * 加载配置
     * @param $filename
     */
    private static function addConfig($filename): void
    {
        $configArr = include_once($filename);
        if (is_array($configArr)) {
            self::$configs = Arr::arrayMergeRecursiveUnique(self::$configs, $configArr);
        }
    }

    /**
     * 导入配置
     * @param $paths
     */
    private static function importConfig($paths): void
    {
        foreach ($paths as $path) {
            self::addConfig($path);
        }
    }
```

## 加载环境变量

环境变量文件，我们默认的就是项目根目录的.env 文件。.env 文件配置项是标准的\*.ini 类型配置文件的书写方式，且.env 文件里面的配置项**不区分大小写**，小写配置项最终会被转化成大写。.env 文件的加载使用 php 的函数**parse_ini_file**来实现：

```PHP
    /**
     * 加载环境变量定义文件
     * @param string $file 环境变量定义文件
     * @return void
     */
    public static function load(string $file): void
    {
        $env = parse_ini_file($file, true) ?: [];
        static::set($env);
    }
```

框架支持环境变量的写入、读取和检测。

## 错误和异常

异常信息抓取到之后，我们将他格式化处理，主要记录异常码、异常文件和所在行号。然后将异常写入日志。(注意，如果是生产模式，需要关闭错误显示)

```PHP
    public static function handler($exception)
    {
        // 设置http状态码，发送header
        if (in_array($exception->getCode(), array_keys(Http::$httpStatus))) {
            self::$httpCode = $exception->getCode();
        } else {
            self::$httpCode = 500;
        }
        Http::sendHeader(self::$httpCode);

        // 异常信息格式化输出
        $echoExceptionString = "<b>message</b>:  {$exception->getMessage()}<br/>" .
            "<b>code</b>:  {$exception->getCode()}<br/>" .
            "<b>file</b>:  {$exception->getFile()}<br/>" .
            "<b>line</b>:  {$exception->getLine()}<br/>";

        $serverVarDump = Str::dump(false, $_SERVER);
        $postVarDump = Str::dump(false, $_POST);
        $filesVarDump = Str::dump(false, $_FILES);
        $cookieVarDump = Str::dump(false, $_COOKIE);

        $logExceptionString = "message:  {$exception->getMessage()}" . PHP_EOL .
            "code:  {$exception->getCode()}" . PHP_EOL .
            "file:  {$exception->getFile()}" . PHP_EOL .
            "line:  {$exception->getLine()}" . PHP_EOL .
            "\$_SERVER:  {$serverVarDump}" . PHP_EOL .
            "\$_POST:  {$postVarDump}" . PHP_EOL .
            "\$_COOKIE:  {$cookieVarDump}" . PHP_EOL .
            "\$_FILES:  {$filesVarDump}";
        Log::write($logExceptionString, Log::ERROR);

        // debug模式将错误输出
        if (static::isDebugging()) {
            if (self::$isJson) {
                echo Json::encode(["message" => $exception->getMessage(), "code" => 0]);
                App::_end();
            } else {
                echo $echoExceptionString;
            }
        }
    }

```

## 路由分发

路由的实现思路是：我们根据请求的地址，截取到请求的路径信息（根据 PHP**全局变量$\_SERVER['PATH_INFO']获取**），根据路径信息的格式，定位到某个控制器类的某个方法，然后将其触发。实现代码：

```PHP
    public function distribute()
    {
        // 解析path_info
        if (isset($_SERVER['PATH_INFO'])) {
            $url = explode('/', trim($_SERVER['PATH_INFO'], "/"));
            if (count($url) < 3) {
                $url = array_pad($url, 3, "index");
            }
        } else {
            $url = array_pad([], 3, "index");
        }

        // 获取类名和方法名
        $className = self::formatClassName($url);
        $actionName = self::formatActionName($url);

        if (!class_exists($className)) {
            throw new Exception("the controller is not exist: {$className}", 404);
        }

        $class = new $className();

        if (!is_callable([$class, $actionName])) {
            throw new Exception("the action is not exist: {$className} -> {$actionName}", 404);
        }

        if (!$class instanceof Controller) {
            throw new Exception("the controller not belongs to fast\\Controller: {$className}", 403);
        }

        // 将请求分发
        $class->$actionName();
    }

```

## 实现缓存

框架中的**缓存、日志、ORM**都是使用**适配器模式**。即定义一个抽象类，抽象类中定义若干抽象方法。这样的话，继承了抽象类的方法必须要实现这些抽象方法。我们就可以通过统一的入口去根据配置去调用对应的适配器类了。

其中缓存适配了 Redis、Memcache 以及 Memcached 三种。开发者可以在 config.php 配置文件中自行配置。

缓存主要实现了将数据写入缓存和获取缓存数据两个方法，我们以 redis 为例，redis 缓存主要是使用 redis 字符串存储结构，使用 set 和 get 方法来实现。

```PHP
    public function get($key, &$time = null, &$expire = null)
    {
        $_key = $this->makeKey($key);
        $res = $this->slaveObj->get($_key);
        if (is_null($res) || false === $res) {
            return null;
        }

        $res = unserialize($res);
        if ($res && isset($res['value'])) {
            $time = $res['time'];
            $expire = $res['expire'];
            return $res['value'];
        }

        return null;
    }

    public function set($key, $value = null, $expire = 3600): bool
    {
        return $this->masterObj->set($this->makeKey($key), serialize($this->makeValue($value, $expire)), $expire);
    }
```

前面的代码只是适配器的实现，那么我们怎么调用适配器类中的方法呢。我这边想到的是，在框架核心代码根目录创建一个缓存文件类，实现一个**单例**，通过配置来读取我们要使用什么类型的缓存（即使用哪个适配器类），配置中配置项是缓存适配器类的类名称，读取到了我们就加载他。具体实现代码:

```PHP
    public static function instance($type = "default"): CacheDriver
    {
        if ($type === "default") {
            $_type = Config::get("Cache.default");
        } else {
            $_type = $type;
        }

        if (!$_type) {
            throw new Exception("The type can not be set to empty!");
        }

        if (!isset(self::$_instance[$_type])) {
            $conf = Config::get("Cache.{$_type}");

            if (empty($conf)) {
                throw new Exception("The '{$_type}' type cache config does not exists!");
            }

            $class = self::getNamespace() . "\\" . ucfirst($_type);
            $obj = new $class();

            if (!$obj instanceof CacheDriver) {
                throw new Exception("The '{$class}' not instanceof CacheDriver!");
            }

            $obj->init($conf);
            self::$_instance[$_type] = $obj;

        } else {
            $obj = self::$_instance[$_type];
        }

        return $obj;
    }
```

_注：日志以及 ORM 的实现方法和缓存的实现类似，也是通过实现一个适配器，然后通过加载配置中定义的适配器类来加载。_

实现完了之后我们测试一下：

设置：

```PHP
        $cacheObj = Cache::instance('redis');
        $setRes = $cacheObj->setModuleName("user")->set(["id" => 1], ["name" => "ZhangSan"], 1000);
        if ($setRes) {
            echo "设置成功";
        } else {
            echo "设置失败";
        }
```

获取：

```PHP
        $cacheObj = Cache::instance('redis');
        $res = $cacheObj->setModuleName("user")->get(["id" => 1], $time, $expire);
        var_dump($res, $time, $expire);
```

## 实现日志

日志的实现比较简单，主要值实现了日志的写入功能，通过 php 函数**file_put_contents**实现写入文件。当然也可以使用别的方法来实现。
相关代码：

```PHP
public function write(string $message, string $type)
    {
        if (empty($message)) {
            trigger_error('$message dose not empty! ');

            return false;
        }

        if (empty($type)) {
            trigger_error('$type dose not empty! ');

            return false;
        }

        $path = APP_PATH . DIRECTORY_SEPARATOR . 'runtime' . DIRECTORY_SEPARATOR . 'logs' . DIRECTORY_SEPARATOR . $type . '/' . date('Ym/d') . '.log';

        $mark = "\n\n===========================================================================\n";
        $mark .= 'time:' . date('Y/m/d H:i:s') . "\n";

        return \fast\util\File::write($mark . $message, $path, (FILE_APPEND | LOCK_EX));
    }
```

```PHP
    public static function write($content, $path, $flags = 0)
    {
        $path = trim($path);
        if (empty($path)) {
            trigger_error('$path must to be set!');

            return false;
        }

        $dir = dirname($path);
        if (!self::exists($dir)) {
            if (false == self::mkdir($dir)) {
                trigger_error('filesystem is not writable: ' . $dir);

                return false;
            }
        }
        $path = str_replace("//", "/", $path);

        return file_put_contents($path, $content, ((empty($flags)) ? (LOCK_EX) : $flags));
    }
```

应用层调用：

```PHP
Log::write("这是一条info类型的log", Log::INFO);
```

## 实现操作数据库

数据库目前只实现了 Mysql，如果需要支持别的数据库，只需要新增适配器即可。区别于缓存的实现，数据库使用**接口 interface**作为适配器的约定。

mysql 的实现主要依赖 mysqli 库，它对 mysql 库做了优化，防注入更完善一些。CURD 的具体实现思路是，先获取要处理的数据，最终拼接成 sql 来执行。

_注：链式调用通过方法返回$this 来实现_

简单看一下 select 查询的实现：

```PHP
    public function select()
    {
        $this->checkMysqlOperate("table_empty");
        empty($this->_fields) && $this->_fields = "*";

        $sql = "SELECT {$this->_fields} FROM {$this->_table}";
        !empty($this->_where) && $sql .= " WHERE {$this->_where}";
        !empty($this->_order) && $sql .= " ORDER BY {$this->_order}";
        !empty($this->_group) && $sql .= " GROUP BY {$this->_group}";
        !empty($this->_limit) && $sql .= " LIMIT {$this->_offset}, {$this->_limit}";

        $this->_sql = $sql;
        $mysqliResult = mysqli_query($this->_connection, $this->_sql);
        if (false === $mysqliResult) {
            $this->_error = mysqli_error($this->_connection);
            return false;
        }
        return mysqli_fetch_all($mysqliResult, MYSQLI_ASSOC);
    }
```

我们在应用层调用一下 select：

```PHP
  $dbInstance = Db::getInstance();
  $result = $dbInstance->table('student')->where('SId in (01, 02, 13)')->order("SId DESC")->select();
```

update:

```PHP
  $dbInstance = Db::getInstance();
  $dbInstance->table('student');
  $dbInstance->where(['Sid' => '01']);
  $result = $dbInstance->update($data);
```

## 数据验证器

数据验证器主要是用来验证数据是否符合我们的规范，可以用来验证表单数据，也可以用来验证业务数据。

主要实现是列举所有的验证规则依次校验，主要有这些规则校验：必传校验、类型校验、字符校验、数字校验、正则校验。

主要实现代码：

```PHP
    public function check(array $data, array $rules): self
    {
        foreach ($rules as $rule => $message) {
            $dataRule = explode(".", $rule);
            if (count($dataRule) < 2) {
                continue;
            }

            // 必传校验
            if ($dataRule[1] == "required" && !isset($data[$dataRule[0]])) {
                array_push($this->errors, $message);
                continue;
            }

            if (!isset($data[$dataRule[0]])) {
                continue;
            }

            // 类型校验
            if (in_array($dataRule[1], $this->typeCheckName)) {
                if (false === self::typeCheck(strval($dataRule[1]), $data[$dataRule[0]])) {
                    array_push($this->errors, $message);
                    continue;
                }
            }

            // 字符校验
            if (in_array($dataRule[1], $this->stringCheckName) && isset($dataRule[2])) {
                if (false === self::stringCheck(strval($dataRule[1]), $dataRule[2], $data[$dataRule[0]])) {
                    array_push($this->errors, $message);
                    continue;
                }
            }

            // 数字校验
            if (in_array($dataRule[1], $this->operatorCheckName) && isset($dataRule[2])) {
                if (false === self::operatorCheck(strval($dataRule[1]), $dataRule[2], $data[$dataRule[0]])) {
                    array_push($this->errors, $message);
                    continue;
                }
            }

            // 正则校验
            if (in_array($dataRule[1], array_keys($this->pregCheckRules))) {
                if (false === self::pregCheck(strval($dataRule[1]), $data[$dataRule[0]])) {
                    array_push($this->errors, $message);
                    continue;
                }
            }
        }
        return $this;
    }
```

字符传校验部分代码：

```PHP
    public function stringCheck(string $rule, $value, $dataValue): bool
    {
        $flag = true;
        switch ($rule) {
            case "max":
                strlen($dataValue) > $value && $flag = false;
                break;
            case "min":
                strlen($dataValue) < $value && $flag = false;
                break;
            case "length":
                strlen($dataValue) != $value && $flag = false;
                break;
            case "in":
                $value = explode(",", $value);
                !in_array($dataValue, $value) && $flag = false;
                break;
            case "notIn":
                $value = explode(",", $value);
                in_array($dataValue, $value) && $flag = false;
                break;
        }
        return $flag;
    }
```

业务层这样调用：

```PHP
    public function testValidate()
    {
        $validate = new ValidateData();
        $data = [
            "age" => 17,
            "weight" => "50公斤",
            "name" => "ZhangSan",
            "country" => "这里是中国abc",
            "sex" => "未知",
            "mobile" => "11098186452",
        ];

        $rules = [
            "age.required" => "请输入年龄",
            "email.required" => "请输入邮箱",
            "age.gt.18" => "年龄必须大于18",
            "weight.float" => "体重必须为浮点数",
            "name.max.6" => "姓名最大长度为6",
            "country.alphaNum" => "国家必须为数字或者字母",
            "sex.in.男,女" => "性别必须是男或者女",
            "mobile.mobile" => "手机号码不合法",
        ];
        $validate->check($data, $rules);

        var_dump($validate->getErrors());
    }
```

## 实现容器依赖注入

首先我们先了解概念。框架中的容器指的是什么？什么是依赖注入？

**容器**（当前所指）是一个用于管理和存储应用程序中各种对象的工具。它允许你注册、创建和解析对象，以及管理它们之间的依赖关系。当前框架中的容器通常使用**关联数组**来存储对象和服务。

**依赖注入**是一种设计模式，它允许你将一个对象的依赖关系传递给它，而不是在对象内部直接创建或管理依赖关系。
这可以使代码更加可测试、可维护和可扩展，因为它将对象的依赖性解耦，并使它们更容易替换和修改。
依赖注入通常通过构造函数注入、方法注入或属性注入来实现。
在当前框架中，依赖注入和容器一起使用，容器负责实例化和解析对象，并自动注入它们的依赖关系。

那么如何实现呢？通过 php 的**反射**，来获取类的相关信息来解决依赖。

我们从容器中拿一个服务对象，如果没有拿到，则需要创建。创建的时候通过下面几步我们来解决依赖。

1. 根据类名获取目标类（实际是反射类）

```PHP
$reflection = new \ReflectionClass($className)
```

2. 进一步获取目标类的构造方法（实际是构造方法类）

```PHP
$reflection->getConstructor()
```

3. 获取构造方法所需参数类（是一个数组）

```PHP
$constructorParameters = $constructor->getParameters()
```

4. 循环所需参数，如果参数没有默认值，则是一个服务对象，我们继续从容器中获取，直到解决所有的依赖。

```PHP
foreach ($constructorParameters as $param) {
    if (version_compare(PHP_VERSION, '5.6.0', '>=') && $param->isVariadic()) {
        break;
    } elseif ($param->isDefaultValueAvailable()) {
        $dependencies[] = $param->getDefaultValue();
    } else {
        $c = $param->getClass();
        $dependencies[] = $this->get($c->getName(), $this->_params[$c->getName()] ?? []);
    }
}
```

_注：请避免出现循环嵌套，否则会出现未知问题_

创建的完整代码：

```PHP
    public function build(string $className, array $params = []): ?object
    {
        if (isset($this->_reflections[$className])) {
            $reflection = $this->_reflections[$className];
        } else {
            try {
                $reflection = new \ReflectionClass($className);
            } catch (ReflectionException $exception) {
                throw new Exception("Failed to reflect class " . $className . ", error: " . $exception->getMessage());
            }
            $this->_reflections[$className] = $reflection;
        }

        if (!$reflection->isInstantiable()) {
            throw new Exception("Is not instantiable:" . $reflection->name);
        }

        $dependencies = [];
        $constructor = $reflection->getConstructor();
        if ($constructor !== null) {
            $constructorParameters = $constructor->getParameters();
            foreach ($constructorParameters as $param) {
                if (version_compare(PHP_VERSION, '5.6.0', '>=') && $param->isVariadic()) {
                    break;
                } elseif ($param->isDefaultValueAvailable()) {
                    $dependencies[] = $param->getDefaultValue();
                } else {
                    $c = $param->getClass();
                    $dependencies[] = $this->get($c->getName(), $this->_params[$c->getName()] ?? []);
                }
            }
        }

        $this->_dependencies[$className] = Arr::arrayMergeBase($dependencies, $params);
        $object = $reflection->newInstanceArgs($this->_dependencies[$className]);
        $this->_objects[$className] = $object;
        return $object;
    }
}
```

解决完依赖，我们就把改服务存入容器中。

业务层调用：

```PHP
    $container = new Container();
    $container->set("app\service\Group", [123]);
    $container->set("app\service\User");
    $container->set("app\service\UserList");
    $group = $container->get("app\service\Group");
    $userList = $container->get("app\service\UserList");
    $group->getA();
    $userList->getUserList();
```

Group.php：

```PHP
<?php
namespace app\service;

class Group
{
    public static $a = 0;

    function __construct($a =1)
    {
        static::$a = $a;
    }

    public function getA()
    {
        echo self::$a;
    }
}
```

User.php：

```PHP
<?php
namespace app\service;

class User
{
    public function __construct(Group $group)
    {

    }

    function user()
    {

    }
}
```

UserList.php：

```PHP
<?php
namespace app\service;

class UserList
{
    public function __construct(User $user)
    {

    }

    public function getUserList()
    {
        echo "this is the user-list";
    }
}
```

## 尾声

至此，这款简易的 php 框架的实现过程就介绍完了。更多详细的内容请异步:

[https://github.com/yijiebaiyi/fast_framework](https://github.com/yijiebaiyi/fast_framework)

这里有详细的代码示例和完整的实现过程。
