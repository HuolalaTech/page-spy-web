package main

import (
	"log"

	"github.com/HuolalaTech/page-spy-api/config"
	"github.com/HuolalaTech/page-spy-api/container"
	"github.com/HuolalaTech/page-spy-api/serve"
)

func main() {
	container := container.Container()
	err := container.Provide(func() *config.StaticConfig {
		return nil
	})

	if err != nil {
		log.Fatal(err)
	}
	serve.Run()
}
