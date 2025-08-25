defmodule WsServerTest do
  use ExUnit.Case
  doctest WsServer

  test "greets the world" do
    assert WsServer.hello() == :world
  end
end
